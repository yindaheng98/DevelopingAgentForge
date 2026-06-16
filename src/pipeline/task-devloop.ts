import type { AgentTeam, RecordCallback } from "coding-agent-forge";
import {
  Memory,
  defaultMemoryAgentNames,
  type MemoryAgentVariablesByName,
} from "memory-agent-forge";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  CodeReviewerVariables,
  DeveloperVariables,
  DevelopingAgentVariables,
} from "../agents/index.js";

export type TaskDevLoopAgentVariablesByName = {
  developer: DeveloperVariables;
  "code-reviewer": CodeReviewerVariables;
} & MemoryAgentVariablesByName;

const ACCEPT_MARK = "ACCEPT";
const MEMORY_DOMAIN_HINT =
  "Code design memory for logic relationships between code, design rationale, invariants, and implementation decisions in the target repository.";

export class TaskDevLoop {
  async develop(
    team: AgentTeam<TaskDevLoopAgentVariablesByName>,
    targetPath: string,
    codingStyleSkillPath: string,
    goal: string,
    archiveDir: string,
    maxIterations: number,
    currentTask: string,
    codeDesignMemoryPath: string,
    maxMemoryRounds: number,
    logRecord?: RecordCallback,
  ): Promise<string[]> {
    const agentVariables: DevelopingAgentVariables = {
      targetPath,
      codingStyleSkillPath,
      goal,
    };

    await mkdir(archiveDir, { recursive: true });

    const developer = await team.createAgent("developer");
    const codeReviewer = await team.createAgent("code-reviewer");
    const memoryStore = new Memory(defaultMemoryAgentNames);
    const memoryGuidance = (
      await developer.runStreamed(
        {
          ...agentVariables,
          currentTask,
          phase: "recall",
        },
        logRecord,
      )
    ).trim();
    await writeFile(
      path.join(archiveDir, "task_devloop_memory_recall_guidance.md"),
      memoryGuidance,
      "utf8",
    );
    const memory = (
      await memoryStore.recall(
        team,
        MEMORY_DOMAIN_HINT,
        codeDesignMemoryPath,
        maxMemoryRounds,
        memoryGuidance,
        logRecord,
      )
    )
      .map(({ content }) => content)
      .join("\n\n");
    await writeFile(path.join(archiveDir, "task_devloop_recalled_memory.md"), memory, "utf8");

    let previousReviewerReport = "";
    const taskDevReports: string[] = [];

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      console.log(`\n# Developer/reviewer iteration ${String(iteration)}\n`);

      const developerVariables: DeveloperVariables = {
        ...agentVariables,
        currentTask,
        memory,
        phase: "develop",
      };
      if (previousReviewerReport) {
        developerVariables.reviewerReport = previousReviewerReport;
      }

      const developerReport = (await developer.runStreamed(developerVariables, logRecord)).trim();
      await writeFile(
        path.join(archiveDir, `developer_report_${String(iteration).padStart(3, "0")}.md`),
        developerReport,
        "utf8",
      );
      taskDevReports.push(`Developer report ${String(iteration)}:\n${developerReport}`);

      const reviewerReport = (
        await codeReviewer.runStreamed(
          {
            ...agentVariables,
            acceptMark: ACCEPT_MARK,
            currentTask,
            developerReport,
          },
          logRecord,
        )
      ).trim();
      await writeFile(
        path.join(archiveDir, `code_review_${String(iteration).padStart(3, "0")}.md`),
        reviewerReport,
        "utf8",
      );
      taskDevReports.push(`Reviewer report ${String(iteration)}:\n${reviewerReport}`);

      const accepted = reviewerReport.trim() === ACCEPT_MARK;
      if (accepted) {
        taskDevReports.push("Reviewer accepted the changes.");
      }

      if (!accepted && iteration === maxIterations) {
        taskDevReports.push(
          "Reviewer did not accept the changes before the maximum review attempts.",
        );
      }

      if (accepted) {
        break;
      }
      previousReviewerReport = reviewerReport;
    }

    const taskDevReport = taskDevReports.join("\n\n");
    await writeFile(path.join(archiveDir, "task_devloop_report.md"), taskDevReport, "utf8");
    const thingsToRemember = (
      await developer.runStreamed(
        {
          ...agentVariables,
          currentTask,
          memory,
          phase: "update",
          taskDevReport,
        },
        logRecord,
      )
    ).trim();
    await writeFile(
      path.join(archiveDir, "task_devloop_things_to_remember.md"),
      thingsToRemember,
      "utf8",
    );
    await memoryStore.remember(
      team,
      MEMORY_DOMAIN_HINT,
      codeDesignMemoryPath,
      maxMemoryRounds,
      thingsToRemember,
      logRecord,
    );
    return taskDevReports;
  }
}
