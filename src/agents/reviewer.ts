import type { RecordCallback } from "coding-agent-forge";
import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type CodeReviewerVariables = DevelopingAgentVariables & {
  taskBrief: string;
  developerReport: string;
  codeDesignMemory: string;
};

export type ReviewDecision = "ACCEPT" | "REVISE" | "REDIRECT";
const REVIEW_DECISION_PATTERN = /^(ACCEPT|REVISE|REDIRECT)/;
const MAX_FORMAT_CORRECTION_ATTEMPTS = 8;

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
Previous review output did not follow the required format.
The output must start with exactly one of:
ACCEPT
REVISE
REDIRECT

Previous output:
${reviewerReport}

Please correct it.
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
    const codingStyleSkillPath = this.workspaceRelativePath(variables.codingStyleSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);
    const goalInstructionText = goalInstruction(variables.goal);

    return (
      codingStyleSkillInstructionText +
      `

Work in the target repository at ${targetPath}/.
Review the current code. Read only.

${goalInstructionText}

Task Brief:
${variables.taskBrief}

Related code design memory:
${variables.codeDesignMemory}

Developer report:
${variables.developerReport}

Review the Developer's result using the Task Brief, Developer report, and code design memory.

Focus on:
- whether the Objective is actually improved
- whether the evidence supports the Developer's claims
- whether the code quality and design remain healthy
- whether the change respects existing code relationships and design memory
- whether the next action should be revision, manager redirection, or acceptance

On the first non-empty line, output exactly one decision:
ACCEPT
REVISE
REDIRECT

Use ACCEPT when the result is good enough.
Use REVISE when the Developer can improve the result within the same task direction.
Use REDIRECT when the task direction, scope, dependency, or premise should be reconsidered by the Manager.

After the decision, give concise feedback unless ACCEPT. Also list any reusable memory candidates.
`
    );
  }
}
