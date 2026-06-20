import { ponytailSkillPrompt } from "./polytail.js";
import { goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

type RecallDeveloperVariables = DevelopingAgentVariables & {
  taskBrief: string;
  phase: "recall";
};

type DevelopDeveloperVariables = DevelopingAgentVariables & {
  taskBrief: string;
  codeDesignMemory: string;
  phase: "develop";
  reviewerReport?: string;
};

type UpdateDeveloperVariables = DevelopingAgentVariables & {
  taskBrief: string;
  codeDesignMemory: string;
  phase: "update";
  taskRoundSummary: string;
};

export type DeveloperVariables =
  | RecallDeveloperVariables
  | DevelopDeveloperVariables
  | UpdateDeveloperVariables;

export class DeveloperAgent extends DevelopingAgent<DeveloperVariables> {
  protected buildPrompt(variables: Readonly<DeveloperVariables>): string {
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const goalInstructionText = goalInstruction(variables.goal);

    switch (variables.phase) {
      case "recall":
        return buildRecallPrompt(goalInstructionText, targetPath, variables.taskBrief);
      case "develop": {
        const reviewerReport = variables.reviewerReport ?? "(none)";
        return buildDevelopPrompt(
          goalInstructionText,
          targetPath,
          variables.taskBrief,
          variables.codeDesignMemory,
          reviewerReport,
        );
      }
      case "update":
        return buildUpdatePrompt(
          goalInstructionText,
          targetPath,
          variables.taskBrief,
          variables.codeDesignMemory,
          variables.taskRoundSummary,
        );
    }
  }
}

function buildRecallPrompt(
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
): string {
  return `
${goalInstructionText}

Target: ${targetPath}/.

Task:
${taskBrief}

Output recall guidance only: code/design memory needed for this task.
No recalled content. No implementation advice.
`;
}

function buildDevelopPrompt(
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
  codeDesignMemory: string,
  reviewerReport: string,
): string {
  return `
${ponytailSkillPrompt}

${goalInstructionText}

Target: ${targetPath}/.

Task:
${taskBrief}

Code/design memory:
${codeDesignMemory}

Reviewer report:
${reviewerReport}

Do the task. Address reviewer report unless "(none)".
Inspect, edit, verify. No disk change? Say why.

Report final state:
- changed
- inspected
- commands
- why complete
- blockers

End with ## Memory Candidates: reusable code/design facts only, empty if none.
`;
}

function buildUpdatePrompt(
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
  codeDesignMemory: string,
  taskRoundSummary: string,
): string {
  return `
${goalInstructionText}

Target: ${targetPath}/.

Task:
${taskBrief}

Code/design memory before:
${codeDesignMemory}

Round summary:
${taskRoundSummary}

Output memory candidates, empty if none: reusable code/design facts (module relationships, constraints, invariants, interfaces, review rules, pitfalls).
Skip transcripts, command output, runtime noise, and project progress.
`;
}
