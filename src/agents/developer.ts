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

Recall code/design memory relevant to the task:
- interfaces
- constraints
- repo conventions
- prior implementation decisions
- useful similar code paths
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

Project root: ${targetPath}/.

Task:
${quoteBlock(taskBrief)}

Code/design memory:
${quoteBlock(codeDesignMemory)}

${reviewerReport}

Complete the task in project root and return a Developer Report.
${reviewerInstruction}
If no change is needed, explain why in the report.

Developer Report format:
# Developer Report
## Changes
- <changed files and behavior>
## Inspection
- <what was checked>
## Verification
- <commands run and results, or why not run>
## Completion
- <why the task is complete, or what blocked it>

Return only: Markdown starting with "# Developer Report".
`;
}

function buildUpdatePrompt(
  goalInstructionText: string,
  targetPath: string,
  taskBrief: string,
  taskRoundSummary: string,
): string {
  return `
${goalInstructionText}

Project root: ${targetPath}/.

Task:
${quoteBlock(taskBrief)}

Round summary:
${quoteBlock(taskRoundSummary)}

Extract reusable code/design memory from this task round.

Include:
- interfaces
- constraints
- invariants
- repo conventions
- implementation decisions that should affect future work

Exclude execution details.

Return only the code/design memory.
`;
}
