import type { RecordCallback } from "coding-agent-forge";
import { ponytailReviewSkillPrompt } from "./polytail.js";
import { goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type CodeReviewerVariables = DevelopingAgentVariables & {
  taskBrief: string;
  developerReport: string;
  codeDesignMemory: string;
};

export type ReviewDecision = "ACCEPT" | "REVISE" | "REDIRECT";
const REVIEW_DECISION_PATTERN = /^(ACCEPT|REVISE|REDIRECT)\b/;
const MAX_FORMAT_CORRECTION_ATTEMPTS = 3;

export class CodeReviewerAgent extends DevelopingAgent<CodeReviewerVariables> {
  override async runStreamed(
    variables: CodeReviewerVariables,
    onRecord?: RecordCallback,
  ): Promise<string> {
    let reviewerReport = await super.runStreamed(variables, onRecord);
    try {
      this.parseDecision(reviewerReport);
      return reviewerReport;
    } catch {
      for (let attempt = 1; attempt <= MAX_FORMAT_CORRECTION_ATTEMPTS; attempt++) {
        reviewerReport = (
          await this.thread.runStreamed(
            `
Incorrect format. First non-empty line must be:
ACCEPT
REVISE
REDIRECT

Previous output:
${reviewerReport}

Correct it.
`,
            onRecord,
          )
        ).trim();
        try {
          this.parseDecision(reviewerReport);
          return reviewerReport;
        } catch {
          if (attempt === MAX_FORMAT_CORRECTION_ATTEMPTS) {
            throw new Error(
              `code-reviewer did not output a valid first-line decision after ${String(MAX_FORMAT_CORRECTION_ATTEMPTS)} correction attempts.`,
            );
          }
        }
      }
    }
    throw new Error("Unreachable code-reviewer format correction state.");
  }

  parseDecision(reviewerReport: string): ReviewDecision {
    const match = REVIEW_DECISION_PATTERN.exec(reviewerReport.trimStart());
    if (match === null) {
      throw new Error("Review report must start with ACCEPT, REVISE, or REDIRECT.");
    }
    return match[1] as ReviewDecision;
  }

  protected buildPrompt(variables: Readonly<CodeReviewerVariables>): string {
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const goalInstructionText = goalInstruction(variables.goal);

    return `
${ponytailReviewSkillPrompt}

${goalInstructionText}

Target: ${targetPath}/. Read only.

Task:
${variables.taskBrief}

Code/design memory:
${variables.codeDesignMemory}

Developer report:
${variables.developerReport}

Review: task completion, report accuracy, code health.

First non-empty line must equal one of:
ACCEPT
REVISE
REDIRECT

ACCEPT: good enough.
REVISE: smallest same-direction fix.
REDIRECT: manager must rethink direction, scope, dependency, or premise.

Feedback required if REVISE or REDIRECT.
End with reusable insights under "## Memory Candidates".
`;
  }
}
