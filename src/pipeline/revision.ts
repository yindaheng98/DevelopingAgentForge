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

export type RevisionAgentVariablesByName = {
  developer: DeveloperVariables;
  "code-reviewer": CodeReviewerVariables;
} & MemoryAgentVariablesByName;

const ACCEPT_MARK = "ACCEPT";
const REVISION_MEMORY_DOMAIN_HINT =
  "Developer revision memory for completing a current task, applying review feedback, and remembering code changes in the target repository.";

export class Revision {
  async revise(
    team: AgentTeam<RevisionAgentVariablesByName>,
    targetPath: string,
    codingStyleSkillPath: string,
    goal: string,
    archiveDir: string,
    maxIterations: number,
    currentTask: string,
    memoryPath: string,
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
      path.join(archiveDir, "memory_recall_guidance.md"),
      memoryGuidance,
      "utf8",
    );
    const memory = (
      await memoryStore.recall(
        team,
        REVISION_MEMORY_DOMAIN_HINT,
        memoryPath,
        maxMemoryRounds,
        memoryGuidance,
        logRecord,
      )
    )
      .map(({ content }) => content)
      .join("\n\n");
    await writeFile(path.join(archiveDir, "memory.md"), memory, "utf8");

    let previousReviewerReport = "";
    const revisionReports: string[] = [];

    for (let revision = 1; revision <= maxIterations; revision++) {
      console.log(`\n# Revision ${String(revision)}\n`);

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
        path.join(archiveDir, `developer_report_${String(revision).padStart(3, "0")}.md`),
        developerReport,
        "utf8",
      );
      revisionReports.push(`Developer report ${String(revision)}:\n${developerReport}`);

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
        path.join(archiveDir, `code_review_${String(revision).padStart(3, "0")}.md`),
        reviewerReport,
        "utf8",
      );
      revisionReports.push(`Reviewer report ${String(revision)}:\n${reviewerReport}`);

      const accepted = reviewerReport.trim() === ACCEPT_MARK;
      if (accepted) {
        revisionReports.push("Reviewer accepted the changes.");
      }

      if (!accepted && revision === maxIterations) {
        revisionReports.push("Reviewer did not accept the changes before max revision iterations.");
      }

      if (accepted) {
        break;
      }
      previousReviewerReport = reviewerReport;
    }

    const revisionReport = revisionReports.join("\n\n");
    await writeFile(path.join(archiveDir, "revision_report.md"), revisionReport, "utf8");
    const thingsToRemember = (
      await developer.runStreamed(
        {
          ...agentVariables,
          currentTask,
          memory,
          phase: "update",
          revisionReport,
        },
        logRecord,
      )
    ).trim();
    await writeFile(
      path.join(archiveDir, "things_to_remember.md"),
      thingsToRemember,
      "utf8",
    );
    await memoryStore.remember(
      team,
      REVISION_MEMORY_DOMAIN_HINT,
      memoryPath,
      maxMemoryRounds,
      thingsToRemember,
      logRecord,
    );
    return revisionReports;
  }
}
