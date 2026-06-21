import type { AgentTeam, RecordCallback } from "coding-agent-forge";
import {
  Memory,
  defaultMemoryAgentNames,
  type MemoryAgentVariablesByName,
} from "memory-agent-forge";
import { appendFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  CodingManagerAgent,
  CodingManagerVariables,
  DevelopingAgentVariables,
} from "../agents/index.js";
import {
  TaskDevLoop,
  type TaskDevLoopAgentVariablesByName,
  type TaskDevLoopResult,
} from "./task-devloop.js";

const PROJECT_STATE_MEMORY_DOMAIN_HINT =
  "Project progress memory for goals, completed tasks, current status, and task-selection context across project iterations.";

export type ProjectDevLoopAgentVariablesByName = TaskDevLoopAgentVariablesByName & {
  "coding-manager": CodingManagerVariables;
} & MemoryAgentVariablesByName;

export type ProjectDevLoopCallbacks = {
  onTaskStart?: (
    agentVariables: DevelopingAgentVariables,
    taskBrief: string,
  ) => Promise<void> | void;
  onTaskFinish?: (
    agentVariables: DevelopingAgentVariables,
    taskBrief: string,
    taskResult: TaskDevLoopResult,
    thingsToRemember: string,
  ) => Promise<void> | void;
};

export class ProjectDevLoop {
  async develop(
    team: AgentTeam<ProjectDevLoopAgentVariablesByName>,
    targetPath: string,
    goal: string,
    achiveDir: string,
    maxIterations: number,
    maxTaskDevLoopIterations: number,
    projectProgressMemoryPath: string,
    codeDesignMemoryPath: string,
    maxMemoryRounds: number,
    memoryCleanInterval: number,
    callbacks?: ProjectDevLoopCallbacks,
  ): Promise<void> {
    const agentVariables: DevelopingAgentVariables = {
      targetPath: path.resolve(targetPath),
      goal,
    };

    await mkdir(achiveDir, { recursive: true });

    const memoryStore = new Memory(defaultMemoryAgentNames);
    const taskDevLoop = new TaskDevLoop();
    let lastTaskRoundSummary: string | undefined;

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      console.log(`\n# Project dev loop iteration ${String(iteration)}\n`);
      const archiveDir = path.join(achiveDir, new Date().toISOString().replace(/[:.]/g, "-"));
      await mkdir(archiveDir, { recursive: true });
      const logRecord: RecordCallback = (thread, record) => {
        appendFileSync(
          path.join(archiveDir, "records.jsonl"),
          `${JSON.stringify(record)}\n`,
          "utf8",
        );
        console.log(thread.recordToPrettyString(record));
      };

      const codingManager = (await team.createAgent("coding-manager")) as CodingManagerAgent;
      const projectProgressMemoryGuidance = (
        await codingManager.runStreamed(
          {
            ...agentVariables,
            phase: "recall",
            ...(lastTaskRoundSummary === undefined ? {} : { lastTaskRoundSummary }),
          },
          logRecord,
        )
      ).trim();
      await writeFile(
        path.join(archiveDir, "project_devloop_memory_recall_guidance.md"),
        projectProgressMemoryGuidance,
        "utf8",
      );

      const projectProgressMemory = (
        await memoryStore.recall(
          team,
          PROJECT_STATE_MEMORY_DOMAIN_HINT,
          projectProgressMemoryPath,
          maxMemoryRounds,
          projectProgressMemoryGuidance,
          logRecord,
        )
      )
        .map(({ content }) => content)
        .join("\n\n");
      await writeFile(
        path.join(archiveDir, "project_devloop_memory_recalled.md"),
        projectProgressMemory,
        "utf8",
      );

      const taskBrief = (
        await codingManager.runStreamed(
          {
            ...agentVariables,
            projectProgressMemory,
            phase: "select",
            ...(lastTaskRoundSummary === undefined ? {} : { lastTaskRoundSummary }),
          },
          logRecord,
        )
      ).trim();
      await writeFile(path.join(archiveDir, "task_brief.md"), taskBrief, "utf8");

      const managerDecision = codingManager.parseDecision(taskBrief);
      if (managerDecision === "FINISHED") {
        console.log("\n# FINISHED\n");
        return;
      }

      await callbacks?.onTaskStart?.(agentVariables, taskBrief);

      const cleanMemory = memoryCleanInterval > 0 && iteration % memoryCleanInterval === 0;
      const taskResult = await taskDevLoop.develop(
        team,
        agentVariables.targetPath,
        agentVariables.goal,
        archiveDir,
        maxTaskDevLoopIterations,
        taskBrief,
        codeDesignMemoryPath,
        maxMemoryRounds,
        cleanMemory,
        logRecord,
      );
      if (taskResult.finalDecision === "REDIRECT" || taskResult.finalDecision === "FAILED") {
        lastTaskRoundSummary = taskResult.taskRoundSummary;
      } else {
        lastTaskRoundSummary = undefined;
      }

      const thingsToRemember = (
        await codingManager.runStreamed(
          {
            ...agentVariables,
            projectProgressMemory,
            phase: "update",
            taskBrief,
            taskRoundSummary: taskResult.taskRoundSummary,
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
        PROJECT_STATE_MEMORY_DOMAIN_HINT,
        projectProgressMemoryPath,
        maxMemoryRounds,
        thingsToRemember,
        logRecord,
      );

      await callbacks?.onTaskFinish?.(agentVariables, taskBrief, taskResult, thingsToRemember);

      if (cleanMemory) {
        console.log(
          `\n# Cleaning project progress memory after project dev loop iteration ${String(iteration)}\n`,
        );
        await memoryStore.clean(
          team,
          PROJECT_STATE_MEMORY_DOMAIN_HINT,
          projectProgressMemoryPath,
          logRecord,
        );
      }
    }

    throw new Error(
      `Reached --max-iterations ${String(maxIterations)} before the coding-manager returned FINISHED.`,
    );
  }
}
