import type { AgentTeam, RecordCallback } from "coding-agent-forge";
import {
  Memory,
  defaultMemoryAgentNames,
  type MemoryAgentVariablesByName,
} from "memory-agent-forge";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  type CodeReviewerAgent,
  type CodeReviewerVariables,
  type DeveloperVariables,
  type DevelopingAgentVariables,
} from "../agents/index.js";
import { quoteBlock } from "../agents/prompts.js";

export type TaskDevLoopAgentVariablesByName = {
  developer: DeveloperVariables;
  "code-reviewer": CodeReviewerVariables;
} & MemoryAgentVariablesByName;

const CODE_DESIGN_MEMORY_DOMAIN_HINT =
  "Code design memory for logic relationships between code, design rationale, invariants, and implementation decisions in the target repository.";

type TaskRoundFinalDecision = "ACCEPT" | "REDIRECT" | "FAILED";

export type TaskDevLoopResult = {
  finalDecision: TaskRoundFinalDecision;
  taskRoundSummary: string;
};

export class TaskDevLoop {
  async develop(
    team: AgentTeam<TaskDevLoopAgentVariablesByName>,
    targetPath: string,
    goal: string,
    archiveDir: string,
    maxIterations: number,
    taskBrief: string,
    codeDesignMemoryPath: string,
    maxMemoryRounds: number,
    cleanMemory?: boolean,
    logRecord?: RecordCallback,
  ): Promise<TaskDevLoopResult> {
    const agentVariables: DevelopingAgentVariables = {
      targetPath,
      goal,
    };

    await mkdir(archiveDir, { recursive: true });

    const developer = await team.createAgent("developer");
    const codeReviewer = (await team.createAgent("code-reviewer")) as CodeReviewerAgent;
    const memoryStore = new Memory(defaultMemoryAgentNames);
    const codeDesignMemoryGuidance = (
      await developer.runStreamed(
        {
          ...agentVariables,
          taskBrief,
          phase: "recall",
        },
        logRecord,
      )
    ).trim();
    await writeFile(
      path.join(archiveDir, "task_devloop_memory_recall_guidance.md"),
      codeDesignMemoryGuidance,
      "utf8",
    );
    const codeDesignMemory = (
      await memoryStore.recall(
        team,
        CODE_DESIGN_MEMORY_DOMAIN_HINT,
        codeDesignMemoryPath,
        maxMemoryRounds,
        codeDesignMemoryGuidance,
        logRecord,
      )
    )
      .map(({ content }) => content)
      .join("\n\n");
    await writeFile(
      path.join(archiveDir, "task_devloop_memory_recalled.md"),
      codeDesignMemory,
      "utf8",
    );

    let previousReviewerReport = "";
    const taskDevReports: string[] = [];
    let finalDecision: TaskRoundFinalDecision = "FAILED";

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      console.log(`\n# Developer/reviewer iteration ${String(iteration)}\n`);

      const developerVariables: DeveloperVariables = {
        ...agentVariables,
        taskBrief,
        codeDesignMemory,
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
            taskBrief,
            developerReport,
            codeDesignMemory,
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

      const reviewDecision = codeReviewer.parseDecision(reviewerReport);

      if (reviewDecision === "ACCEPT") {
        taskDevReports.push("Reviewer accepted the changes.");
        finalDecision = "ACCEPT";
        break;
      }

      if (reviewDecision === "REDIRECT") {
        taskDevReports.push("Reviewer redirected the task to the Manager.");
        finalDecision = "REDIRECT";
        break;
      }

      if (iteration === maxIterations) {
        taskDevReports.push(
          "Reviewer did not accept the changes before the maximum review attempts.",
        );
        finalDecision = "FAILED";
        break;
      }

      previousReviewerReport = reviewerReport;
    }

    const taskDevReport = taskDevReports.join("\n\n");
    await writeFile(path.join(archiveDir, "task_devloop_report.md"), taskDevReport, "utf8");
    const taskRoundSummary = `# Last Task Round Summary

## Task Brief
${quoteBlock(taskBrief)}

## Final Decision
${quoteBlock(finalDecision)}

## Developer/Reviewer Reports
${quoteBlock(taskDevReport)}
`;
    await writeFile(path.join(archiveDir, "task_round_summary.md"), taskRoundSummary, "utf8");

    const thingsToRemember = (
      await developer.runStreamed(
        {
          ...agentVariables,
          taskBrief,
          codeDesignMemory,
          phase: "update",
          taskRoundSummary,
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
      CODE_DESIGN_MEMORY_DOMAIN_HINT,
      codeDesignMemoryPath,
      maxMemoryRounds,
      thingsToRemember,
      logRecord,
    );
    if (cleanMemory) {
      console.log("\n# Cleaning code design memory\n");
      await memoryStore.clean(
        team,
        CODE_DESIGN_MEMORY_DOMAIN_HINT,
        codeDesignMemoryPath,
        logRecord,
      );
    }
    return {
      finalDecision,
      taskRoundSummary,
    };
  }
}
