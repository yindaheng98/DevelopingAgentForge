import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type DeveloperVariables = DevelopingAgentVariables & {
  currentTask: string;
  reviewerReport?: string;
};

export class DeveloperAgent extends DevelopingAgent<DeveloperVariables> {
  protected buildPrompt(variables: Readonly<DeveloperVariables>): string {
    const codingStyleSkillPath = this.workspaceRelativePath(variables.codingStyleSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const reviewerReport = variables.reviewerReport ?? "(none)";
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);
    const goalInstructionText = goalInstruction(variables.goal);

    return `
${codingStyleSkillInstructionText}

Work only in the target repository at ${targetPath}/.
Target repository: ${targetPath}

${goalInstructionText}

Current developer task:
${variables.currentTask}

Reviewer report:
${reviewerReport}

Modify the target repository code for the current task. If a reviewer report is present, update the code according to that report.

Output a concise developer report with the main changes.
`;
  }
}
