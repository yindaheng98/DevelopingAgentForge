import type { RecordCallback } from "coding-agent-forge";
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
  override async runStreamed(
    variables: DeveloperVariables,
    onRecord?: RecordCallback,
  ): Promise<string> {
    if (variables.phase === "recall") {
      return this.buildPrompt(variables);
    }

    return super.runStreamed(variables, onRecord);
  }

  protected buildPrompt(variables: Readonly<DeveloperVariables>): string {
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const goalInstructionText = goalInstruction(variables.goal);
    const reviewerReport =
      "reviewerReport" in variables && variables.reviewerReport
        ? `Reviewer report:
${quoteBlock(variables.reviewerReport)}`
        : "";

    switch (variables.phase) {
      case "recall":
        return buildRecallPrompt(goalInstructionText, variables.taskBrief);
      case "develop": {
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

function buildRecallPrompt(goalInstructionText: string, taskBrief: string): string {
  return `
${goalInstructionText}

Task:
${quoteBlock(taskBrief)}

Recall reusable code/design insights needed for this task towards the goal.
`;
}

function buildDevelopPrompt(
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
  codeDesignMemory: string,
  reviewerReport: string,
): string {
  const reviewerInstruction = reviewerReport ? " Address reviewer concerns." : "";

  return `
${ponytailSkillPrompt}

${goalInstructionText}

Target: ${targetPath}/.

Task:
${quoteBlock(taskBrief)}

Code/design memory:
${quoteBlock(codeDesignMemory)}

${reviewerReport}

Perform the task.${reviewerInstruction}
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
