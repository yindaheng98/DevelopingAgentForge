import type { AgentTeam, RecordCallback } from "coding-agent-forge";
import {
  Memory,
  defaultMemoryAgentNames,
  type MemoryAgentVariablesByName,
} from "memory-agent-forge";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CodingManagerVariables, DevelopingAgentVariables } from "../agents/index.js";
import { TaskDevLoop, type TaskDevLoopAgentVariablesByName } from "./task-devloop.js";

const MEMORY_DOMAIN_HINT =
  "Project dev loop progress memory for goals, completed tasks, current status, and task-selection context across project iterations.";

export type ProjectDevLoopAgentVariablesByName = TaskDevLoopAgentVariablesByName & {
  "coding-manager": CodingManagerVariables;
} & MemoryAgentVariablesByName;

export type ProjectDevLoopCallbacks = {
  onTaskStart?: (
    agentVariables: DevelopingAgentVariables,
    currentTask: string,
  ) => Promise<void> | void;
  onTaskFinish?: (
    agentVariables: DevelopingAgentVariables,
    currentTask: string,
    taskDevReports: readonly string[],
    thingsToRemember: string,
  ) => Promise<void> | void;
};

const FINISH_MARK = "FINISHED";

export class ProjectDevLoop {
  async develop(
    team: AgentTeam<ProjectDevLoopAgentVariablesByName>,
    targetPath: string,
    codingStyleSkillPath: string,
    goal: string,
    achiveDir: string,
    maxIterations: number,
    maxTaskDevLoopIterations: number,
    projectProgressMemoryPath: string,
    codeDesignMemoryPath: string,
    maxMemoryRounds: number,
    callbacks?: ProjectDevLoopCallbacks,
    logRecord?: RecordCallback,
  ): Promise<void> {
    const agentVariables: DevelopingAgentVariables = {
      targetPath: path.resolve(targetPath),
      codingStyleSkillPath: path.resolve(codingStyleSkillPath),
      goal,
    };

    await mkdir(achiveDir, { recursive: true });

    const memoryStore = new Memory(defaultMemoryAgentNames);
    const taskDevLoop = new TaskDevLoop();

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      console.log(`\n# Project dev loop iteration ${String(iteration)}\n`);
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
      await writeFile(
        path.join(archiveDir, "project_devloop_memory_recall_guidance.md"),
        memoryGuidance,
        "utf8",
      );

      const memory = (
        await memoryStore.recall(
          team,
          MEMORY_DOMAIN_HINT,
          projectProgressMemoryPath,
          maxMemoryRounds,
          memoryGuidance,
          logRecord,
        )
      )
        .map(({ content }) => content)
        .join("\n\n");
      await writeFile(path.join(archiveDir, "project_devloop_recalled_memory.md"), memory, "utf8");

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

      const taskDevReports = await taskDevLoop.develop(
        team,
        agentVariables.targetPath,
        agentVariables.codingStyleSkillPath,
        agentVariables.goal,
        archiveDir,
        maxTaskDevLoopIterations,
        currentTask,
        codeDesignMemoryPath,
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
            taskDevReport: taskDevReports.join("\n\n"),
          },
          logRecord,
        )
      ).trim();
      await writeFile(
        path.join(archiveDir, "project_devloop_things_to_remember.md"),
        thingsToRemember,
        "utf8",
      );
      await memoryStore.remember(
        team,
        MEMORY_DOMAIN_HINT,
        projectProgressMemoryPath,
        maxMemoryRounds,
        thingsToRemember,
        logRecord,
      );

      await callbacks?.onTaskFinish?.(
        agentVariables,
        currentTask,
        taskDevReports,
        thingsToRemember,
      );
    }

    throw new Error(
      `Reached --max-iterations ${String(maxIterations)} before the coding-manager returned ${FINISH_MARK}.`,
    );
  }
}
