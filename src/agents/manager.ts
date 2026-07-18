import type { RecordCallback } from "coding-agent-forge";
import { goalInstruction, quoteBlock } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

type RecallCodingManagerVariables = DevelopingAgentVariables & {
  phase: "recall";
  lastTaskRoundSummary?: string;
};

type SelectCodingManagerVariables = DevelopingAgentVariables & {
  projectProgressMemory: string;
  phase: "select";
  lastTaskRoundSummary?: string;
};

type UpdateCodingManagerVariables = DevelopingAgentVariables & {
  projectProgressMemory: string;
  phase: "update";
  taskBrief: string;
  taskRoundSummary: string;
};

export type CodingManagerVariables =
  | RecallCodingManagerVariables
  | SelectCodingManagerVariables
  | UpdateCodingManagerVariables;

export type CodingManagerDecision = "FINISHED" | "TASK_BRIEF";
const MANAGER_DECISION_PATTERN = /^(FINISHED|# Task Brief)\b/;
const MAX_FORMAT_CORRECTION_ATTEMPTS = 3;

export class CodingManagerAgent extends DevelopingAgent<CodingManagerVariables> {
  override async runStreamed(
    variables: CodingManagerVariables,
    onRecord?: RecordCallback,
  ): Promise<string> {
    if (variables.phase === "recall") {
      return this.buildPrompt(variables);
    }

    let managerOutput = await super.runStreamed(variables, onRecord);
    if (variables.phase !== "select") {
      return managerOutput;
    }

    try {
      this.parseDecision(managerOutput);
      return managerOutput;
    } catch {
      for (let attempt = 1; attempt <= MAX_FORMAT_CORRECTION_ATTEMPTS; attempt++) {
        managerOutput = (
          await this.thread.runStreamed(
            `
Bad format.

Valid output:
- exactly FINISHED
- Markdown starting with "# Task Brief"

Previous output:
${quoteBlock(managerOutput)}

Fix format only. Keep the same decision and content.

Return only corrected output.
`,
            onRecord,
          )
        ).trim();
        try {
          this.parseDecision(managerOutput);
          return managerOutput;
        } catch {
          if (attempt === MAX_FORMAT_CORRECTION_ATTEMPTS) {
            throw new Error(
              `coding-manager did not output a valid select decision after ${String(MAX_FORMAT_CORRECTION_ATTEMPTS)} correction attempts.`,
            );
          }
        }
      }
    }
    throw new Error("Unreachable coding-manager format correction state.");
  }

  parseDecision(managerOutput: string): CodingManagerDecision {
    const match = MANAGER_DECISION_PATTERN.exec(managerOutput.trimStart());
    if (match === null) {
      throw new Error(
        "Coding manager output first non-empty line must be exactly one of the 2 decision marks: FINISHED or # Task Brief.",
      );
    }
    return match[1] === "FINISHED" ? "FINISHED" : "TASK_BRIEF";
  }

  protected buildPrompt(variables: Readonly<CodingManagerVariables>): string {
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const goalInstructionText = goalInstruction(variables.goal);
    const lastTaskRoundSummary =
      "lastTaskRoundSummary" in variables && variables.lastTaskRoundSummary
        ? `Last round:
${quoteBlock(variables.lastTaskRoundSummary)}`
        : "";

    switch (variables.phase) {
      case "recall":
        return buildRecallPrompt(goalInstructionText);
      case "select":
        return buildSelectPrompt(
          goalInstructionText,
          targetPath,
          variables.projectProgressMemory,
          lastTaskRoundSummary,
        );
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

function buildRecallPrompt(goalInstructionText: string): string {
  return `
${goalInstructionText}

Recall project progress relevant to the current goal:
- completed milestones
- blockers
- possible next steps
`;
}

function buildSelectPrompt(
  goalInstructionText: string,
  targetPath: string,
  projectProgressMemory: string,
  lastTaskRoundSummary: string,
): string {
  return `
${goalInstructionText}

Project root: ${targetPath}

Project progress memory:
${quoteBlock(projectProgressMemory)}

${lastTaskRoundSummary}

Decide the next step for the current goal.
Return FINISHED if no useful bounded task remains for the current goal.
Otherwise return one bounded task towards the current goal in this format:

# Task Brief
## Objective
Concrete task outcome.
## Context
Why now.
## Boundaries
Scope, risks, key paths. Empty if unknown.
## Reviewer Focus
What to check.

Return only: FINISHED | Markdown starting with "# Task Brief".
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

Project root: ${targetPath}

Task:
${quoteBlock(taskBrief)}

Round summary:
${quoteBlock(taskRoundSummary)}

Extract project progress memory from this task round for the current goal.

Include:
- completed milestones
- blockers
- possible next steps

Exclude execution details and code specifics.

Return only the project progress memory.
`;
}
