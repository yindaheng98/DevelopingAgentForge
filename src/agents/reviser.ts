import type { AgentTeam, RecordCallback } from "coding-agent-forge";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { DeveloperVariables } from "./developer.js";
import type { CodeReviewerVariables } from "./reviewer.js";
import type { DevelopingAgentVariables } from "./types.js";

export type ReviserAgentVariablesByName = {
  developer: DeveloperVariables;
  "code-reviewer": CodeReviewerVariables;
};

const ACCEPT_MARK = "ACCEPT";

export class Reviser {
  async revise(
    team: AgentTeam<ReviserAgentVariablesByName>,
    targetPath: string,
    codingStyleSkillPath: string,
    goal: string,
    archiveDir: string,
    maxIterations: number,
    currentTask: string,
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
    let previousReviewerReport = "";
    const revisionReports: string[] = [];

    for (let revision = 1; revision <= maxIterations; revision++) {
      console.log(`\n# Revision ${String(revision)}\n`);

      const developerVariables: DeveloperVariables = {
        ...agentVariables,
        currentTask,
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

    await writeFile(path.join(archiveDir, "revision_report.md"), revisionReports.join("\n\n"), "utf8");
    return revisionReports;
  }
}
