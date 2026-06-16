import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type CodeReviewerVariables = DevelopingAgentVariables & {
  acceptMark: string;
  currentTask: string;
  developerReport: string;
};

export class CodeReviewerAgent extends DevelopingAgent<CodeReviewerVariables> {
  protected buildPrompt(variables: Readonly<CodeReviewerVariables>): string {
    const codingStyleSkillPath = this.workspaceRelativePath(variables.codingStyleSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);
    const goalInstructionText = goalInstruction(variables.goal);

    return (
      codingStyleSkillInstructionText +
      `

Work in the target repository at ${targetPath}/.
Review the current code. Read only.

${goalInstructionText}

Current developing task:
${variables.currentTask}

Developer report:
${variables.developerReport}

If the code for the current task is complete and needs no more changes, output exactly:
${variables.acceptMark}

Otherwise output the revision feedback for the Developer.
`
    );
  }
}
