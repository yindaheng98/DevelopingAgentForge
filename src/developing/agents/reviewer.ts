import { codingStyleSkillInstruction } from "./prompts.js";
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
    const paperBlueprintPath = this.workspaceRelativePath(variables.paperBlueprintPath);
    const experimentPlanPath = this.workspaceRelativePath(variables.experimentPlanPath);
    const codingPlanPath = this.workspaceRelativePath(variables.codingPlanPath);
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);

    return (
      codingStyleSkillInstructionText +
      `

Review the current developer task result. Read only.

Read:
- target repository: ${targetPath}
- paper blueprint: ${paperBlueprintPath}
- experiment plan: ${experimentPlanPath}
- coding plan: ${codingPlanPath}

Current developer task:
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
