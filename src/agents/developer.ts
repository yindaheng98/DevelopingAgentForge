import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

type RecallDeveloperVariables = DevelopingAgentVariables & {
  currentTask: string;
  phase: "recall";
};

type DevelopDeveloperVariables = DevelopingAgentVariables & {
  currentTask: string;
  memory: string;
  phase: "develop";
  reviewerReport?: string;
};

type UpdateDeveloperVariables = DevelopingAgentVariables & {
  currentTask: string;
  memory: string;
  phase: "update";
  taskDevReport: string;
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
          variables.currentTask,
        );
      case "update":
        return buildUpdatePrompt(
          codingStyleSkillInstructionText,
          goalInstructionText,
          targetPath,
          variables.currentTask,
          variables.memory,
          variables.taskDevReport,
        );
      case "develop": {
        const reviewerReport = variables.reviewerReport ?? "(none)";
        return buildDevelopPrompt(
          codingStyleSkillInstructionText,
          goalInstructionText,
          targetPath,
          variables.currentTask,
          variables.memory,
          reviewerReport,
        );
      }
    }
  }
}

function buildRecallPrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  currentTask: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Current task:
${currentTask}

Scan the target repository at ${targetPath}/ and decide what code design memory helps complete the current task.

Output concise code design memory recall guidance.
`;
}

function buildUpdatePrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  currentTask: string,
  memory: string,
  taskDevReport: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Current task:
${currentTask}

Related code design memory before the current task:
${memory}

Revision process for completing the current task:
${taskDevReport}

Scan the target repository at ${targetPath}/ and consider what code logic relationships and design reasons should be remembered after the current task.

Remember code logic relationships and why the current design matches the repository.
`;
}

function buildDevelopPrompt(
  codingStyleSkillInstructionText: string,
  goalInstructionText: string,
  targetPath: string,
  currentTask: string,
  memory: string,
  reviewerReport: string,
): string {
  return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Related code design memory:
${memory}

Work in the target repository at ${targetPath}/.

Current task:
${currentTask}

Reviewer report:
${reviewerReport}

Modify the target repository code for the current task. If a reviewer report is present, update the code according to that report.

Output a concise developer report with the main changes.
`;
}
