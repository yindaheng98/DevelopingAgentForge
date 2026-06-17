import { ponytailSkillPrompt } from "./polytail.js";
import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
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
    const codingStyleSkillPath = this.workspaceRelativePath(variables.codingStyleSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);
    const goalInstructionText = goalInstruction(variables.goal);

    switch (variables.phase) {
      case "recall":
        return buildRecallPrompt(
          codingStyleSkillInstructionText,
          goalInstructionText,
          targetPath,
          variables.taskBrief,
        );
      case "develop": {
        const reviewerReport = variables.reviewerReport ?? "(none)";
        return buildDevelopPrompt(
          codingStyleSkillInstructionText,
          goalInstructionText,
          targetPath,
          variables.taskBrief,
          variables.codeDesignMemory,
          reviewerReport,
        );
      }
      case "update":
        return buildUpdatePrompt(
          codingStyleSkillInstructionText,
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
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Task Brief:
${taskBrief}

Scan the target repository at ${targetPath}/ and decide what code design memory helps complete the Task Brief.

Output concise code design memory recall guidance.
`;
}

function buildDevelopPrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
  codeDesignMemory: string,
  reviewerReport: string,
): string {
  return `
${ponytailSkillPrompt}

${codingStyleSkillInstructionText}

${goalInstructionText}

Related code design memory:
${codeDesignMemory}

Work in the target repository at ${targetPath}/.

Task Brief:
${taskBrief}

Reviewer report:
${reviewerReport}

Improve the repository according to the Task Brief. If a reviewer report is present, update the code according to that report.

Use your own judgment to inspect, edit, and verify. If you make no changes, explain why no change is appropriate on disk.

Output a concise developer report with:
- what you changed
- what you inspected
- what commands you ran
- why the result addresses the Objective
- any blockers or uncertainty
- any code relationships or design lessons that should be remembered
`;
}

function buildUpdatePrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
  codeDesignMemory: string,
  taskRoundSummary: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Task Brief:
${taskBrief}

Related code design memory before the task:
${codeDesignMemory}

Reality-aware task round summary:
${taskRoundSummary}

Scan the target repository at ${targetPath}/ and consider what reusable code logic relationships and design reasons should be remembered after this task.

Remember only reusable code/design memory: module relationships, architecture constraints, invariants, interface design, review rules, and pitfalls. Do not store long transcripts, one-off command output, runtime noise, or project progress state.
`;
}
