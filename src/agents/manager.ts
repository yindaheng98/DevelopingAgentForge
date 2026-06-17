import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

type RecallCodingManagerVariables = DevelopingAgentVariables & {
  phase: "recall";
};

type SelectCodingManagerVariables = DevelopingAgentVariables & {
  memory: string;
  finishMark: string;
  phase: "select";
};

type UpdateCodingManagerVariables = DevelopingAgentVariables & {
  memory: string;
  finishMark: string;
  phase: "update";
  currentTask: string;
  taskDevReport: string;
};

export type CodingManagerVariables =
  | RecallCodingManagerVariables
  | SelectCodingManagerVariables
  | UpdateCodingManagerVariables;

export class CodingManagerAgent extends DevelopingAgent<CodingManagerVariables> {
  protected buildPrompt(variables: Readonly<CodingManagerVariables>): string {
    const codingStyleSkillPath = this.workspaceRelativePath(variables.codingStyleSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);
    const goalInstructionText = goalInstruction(variables.goal);

    switch (variables.phase) {
      case "recall":
        return buildRecallPrompt(codingStyleSkillInstructionText, goalInstructionText, targetPath);
      case "update":
        return buildUpdatePrompt(
          codingStyleSkillInstructionText,
          goalInstructionText,
          targetPath,
          variables.memory,
          variables.currentTask,
          variables.taskDevReport,
        );
      case "select":
        return buildSelectPrompt(
          codingStyleSkillInstructionText,
          goalInstructionText,
          targetPath,
          variables.memory,
          variables.finishMark,
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

function buildUpdatePrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  memory: string,
  currentTask: string,
  taskDevReport: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Developing task:
${currentTask}

Related project progress memory before the developing task:
${memory}

Revision process for completing the developing task:
${taskDevReport}

Scan the target repository at ${targetPath}/ and consider what project progress should be remembered after the developing task.

Remember completed work and current project progress.
`;
}

function buildSelectPrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  memory: string,
  finishMark: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Related project progress memory:
${memory}

Scan the target repository at ${targetPath}/ and read the project progress memory related to the current goal.
Select the next developing task for the target repository.

Choose exactly one new bounded task for the Developer.

When no further developing task is needed, return exactly:
${finishMark}
`;
}
