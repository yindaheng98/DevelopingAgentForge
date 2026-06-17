import type { RecordCallback } from "coding-agent-forge";
import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

type RecallCodingManagerVariables = DevelopingAgentVariables & {
  phase: "recall";
};

type SelectCodingManagerVariables = DevelopingAgentVariables & {
  projectProgressMemory: string;
  phase: "select";
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
const MANAGER_DECISION_PATTERN = /^(FINISHED|# Task Brief)/;
const MAX_FORMAT_CORRECTION_ATTEMPTS = 8;

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
Previous manager output did not follow the required format.
The output must start with exactly one of:
FINISHED
# Task Brief

Previous output:
${managerOutput}

Please correct it.
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
      throw new Error("Coding manager output must start with FINISHED or # Task Brief.");
    }
    return match[1] === "FINISHED" ? "FINISHED" : "TASK_BRIEF";
  }

  protected buildPrompt(variables: Readonly<CodingManagerVariables>): string {
    const codingStyleSkillPath = this.workspaceRelativePath(variables.codingStyleSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);
    const goalInstructionText = goalInstruction(variables.goal);

    switch (variables.phase) {
      case "recall":
        return buildRecallPrompt(codingStyleSkillInstructionText, goalInstructionText, targetPath);
      case "select":
        return buildSelectPrompt(
          codingStyleSkillInstructionText,
          goalInstructionText,
          targetPath,
          variables.projectProgressMemory,
        );
      case "update":
        return buildUpdatePrompt(
          codingStyleSkillInstructionText,
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
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Scan the target repository at ${targetPath}/ and decide what project progress memory helps select the next task for the current goal.

Output concise project progress memory recall guidance.
`;
}

function buildSelectPrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  projectProgressMemory: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Related project progress memory:
${projectProgressMemory}

Scan the target repository at ${targetPath}/ and read the project progress memory related to the current goal.
Select the next developing task for the target repository.

Choose exactly one new bounded task for the Developer.

Output the task as Markdown with this shape:

# Task Brief

## Objective

What should become better in the repository.

## Context

Relevant project state or memory that explains why this task is useful now.

## Boundaries

Known constraints, scope limits, risks, or paths to pay attention to. Leave empty if unknown.

## Reviewer Focus

What the reviewer should pay attention to.

Keep the brief bounded enough for one Developer attempt. Use natural language; do not introduce task-type schemas, check schemas, or mode enums unless they are simply part of the prose.

When no further developing task is needed, return exactly:
FINISHED
`;
}

function buildUpdatePrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  projectProgressMemory: string,
  taskBrief: string,
  taskRoundSummary: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Task Brief:
${taskBrief}

Related project progress memory before the developing task:
${projectProgressMemory}

Reality-aware task round summary:
${taskRoundSummary}

Scan the target repository at ${targetPath}/ and consider what project progress should be remembered after the developing task.

Remember only reusable project state: current goal progress, completed direction, blockers or redirect reasons, and useful next-step context. Do not store long transcripts, one-off runtime noise, or code-design details that belong in code design memory.
`;
}
