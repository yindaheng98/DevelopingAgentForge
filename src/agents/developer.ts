import { ponytailSkillPrompt } from "./polytail.js";
import { goalInstruction, quoteBlock } from "./prompts.js";
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
${quoteBlock(taskBrief)}

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
${quoteBlock(taskBrief)}

Code/design memory:
${quoteBlock(codeDesignMemory)}

Reviewer report:
${quoteBlock(reviewerReport)}

Perform the task. Address reviewer concerns unless marked "(none)".
Inspect, edit, verify. If no changes, explain why.

Final state report includes:
- Changes made
- Inspection results
- Commands used
- Reason for completion
- Any blockers

End with reusable code/design insights under "## Memory Candidates".
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
${quoteBlock(taskBrief)}

Previous code/design memory:
${quoteBlock(codeDesignMemory)}

Round summary:
${quoteBlock(taskRoundSummary)}

List reusable code/design insights only (interfaces, constraints, rules).
Exclude execution details.
`;
}
