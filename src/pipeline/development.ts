import type { AgentTeam, RecordCallback } from "coding-agent-forge";
import {
  Memory,
  defaultMemoryAgentNames,
  type MemoryAgentVariablesByName,
} from "memory-agent-forge";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CodingManagerVariables, DevelopingAgentVariables } from "../agents/index.js";
import { Revision, type RevisionAgentVariablesByName } from "./revision.js";

const DEVELOPMENT_MEMORY_DOMAIN_HINT =
  "Development task memory for goals, completed tasks, task selection context, and current repository state across development iterations.";

export type DevelopmentAgentVariablesByName = RevisionAgentVariablesByName & {
  "coding-manager": CodingManagerVariables;
} & MemoryAgentVariablesByName;

export type DevelopmentCallbacks = {
  onTaskStart?: (
    agentVariables: DevelopingAgentVariables,
    currentTask: string,
  ) => Promise<void> | void;
  onTaskFinish?: (
    agentVariables: DevelopingAgentVariables,
    currentTask: string,
    revisionReports: readonly string[],
    thingsToRemember: string,
  ) => Promise<void> | void;
};

const FINISH_MARK = "FINISHED";

export class Development {
  async develop(
    team: AgentTeam<DevelopmentAgentVariablesByName>,
    targetPath: string,
    codingStyleSkillPath: string,
    goal: string,
    achiveDir: string,
    maxIterations: number,
    maxRevisionIterations: number,
    memoryPath: string,
    maxMemoryRounds: number,
    callbacks?: DevelopmentCallbacks,
    logRecord?: RecordCallback,
  ): Promise<void> {
    const agentVariables: DevelopingAgentVariables = {
      targetPath: path.resolve(targetPath),
      codingStyleSkillPath: path.resolve(codingStyleSkillPath),
      goal,
    };

    await mkdir(achiveDir, { recursive: true });

    const memoryStore = new Memory(defaultMemoryAgentNames);
    const revision = new Revision();

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      console.log(`\n# Developing iteration ${String(iteration)}\n`);
      const archiveDir = path.join(achiveDir, new Date().toISOString().replace(/[:.]/g, "-"));
      await mkdir(archiveDir, { recursive: true });

      const codingManager = await team.createAgent("coding-manager");
      const memoryGuidance = (
        await codingManager.runStreamed(
          {
            ...agentVariables,
            phase: "recall",
          },
          logRecord,
        )
      ).trim();
      await writeFile(path.join(archiveDir, "development_memory_recall_guidance.md"), memoryGuidance, "utf8");

      const memory = (
        await memoryStore.recall(
          team,
          DEVELOPMENT_MEMORY_DOMAIN_HINT,
          memoryPath,
          maxMemoryRounds,
          memoryGuidance,
          logRecord,
        )
      )
        .map(({ content }) => content)
        .join("\n\n");
      await writeFile(path.join(archiveDir, "development_recalled_memory.md"), memory, "utf8");

      const currentTask = (
        await codingManager.runStreamed(
          {
            ...agentVariables,
            memory,
            finishMark: FINISH_MARK,
            phase: "select",
          },
          logRecord,
        )
      ).trim();
      await writeFile(path.join(archiveDir, "current_task.md"), currentTask, "utf8");

      if (currentTask.trim() === FINISH_MARK) {
        console.log(`\n# ${FINISH_MARK}\n`);
        return;
      }

      await callbacks?.onTaskStart?.(agentVariables, currentTask);

      const revisionReports = await revision.revise(
        team,
        agentVariables.targetPath,
        agentVariables.codingStyleSkillPath,
        agentVariables.goal,
        archiveDir,
        maxRevisionIterations,
        currentTask,
        memoryPath,
        maxMemoryRounds,
        logRecord,
      );

      const thingsToRemember = (
        await codingManager.runStreamed(
          {
            ...agentVariables,
            memory,
            finishMark: FINISH_MARK,
            phase: "update",
            currentTask,
            revisionReport: revisionReports.join("\n\n"),
          },
          logRecord,
        )
      ).trim();
      await writeFile(path.join(archiveDir, "development_things_to_remember.md"), thingsToRemember, "utf8");
      await memoryStore.remember(
        team,
        DEVELOPMENT_MEMORY_DOMAIN_HINT,
        memoryPath,
        maxMemoryRounds,
        thingsToRemember,
        logRecord,
      );

      await callbacks?.onTaskFinish?.(
        agentVariables,
        currentTask,
        revisionReports,
        thingsToRemember,
      );
    }

    throw new Error(
      `Reached --max-iterations ${String(maxIterations)} before the coding-manager returned ${FINISH_MARK}.`,
    );
  }
}
