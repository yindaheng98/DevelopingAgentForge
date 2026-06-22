import type { RecordCallback } from "coding-agent-forge";
import { goalInstruction } from "./prompts.js";
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
Incorrect format. First non-empty line must be exactly one of the following 2 decision marks:
FINISHED
# Task Brief

Previous output:
${managerOutput}

Correct it.
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
${variables.lastTaskRoundSummary}`
        : "";

    switch (variables.phase) {
      case "recall":
        return buildRecallPrompt(goalInstructionText, targetPath, lastTaskRoundSummary);
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
          variables.projectProgressMemory,
          variables.taskBrief,
          variables.taskRoundSummary,
        );
    }
  }
}

function buildRecallPrompt(
  goalInstructionText: string,
  targetPath: string,
  lastTaskRoundSummary: string,
): string {
  return `
${goalInstructionText}

Target: ${targetPath}/.

${lastTaskRoundSummary}

Output recall guidance only: project-progress memory needed before choosing next task.
No recalled content. No task decision.
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

Target: ${targetPath}/.

Project progress memory:
${projectProgressMemory}

${lastTaskRoundSummary}

First non-empty line must be exactly one of the following 2 decision marks:
FINISHED
# Task Brief

If no task remains, output exactly:
FINISHED

Otherwise specify one bounded Developer task:

# Task Brief

## Objective

Concrete repo improvement.

## Context

Why now.

## Boundaries

Scope, risks, key paths. Empty if unknown.

## Reviewer Focus

What to check.
`;
}

function buildUpdatePrompt(
  goalInstructionText: string,
  targetPath: string,
  projectProgressMemory: string,
  taskBrief: string,
  taskRoundSummary: string,
): string {
  return `
${goalInstructionText}

Target: ${targetPath}/.

Task:
${taskBrief}

Previous project progress memory:
${projectProgressMemory}

Round summary:
${taskRoundSummary}

Record reusable project progress insights (completed milestones, blockers, next steps).
Exclude execution details and code specifics.
`;
}
