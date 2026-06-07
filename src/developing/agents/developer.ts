import { excellentRepoSkillInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type DeveloperVariables = DevelopingAgentVariables & {
  currentTask: string;
  reviewerReport?: string;
};

export class DeveloperAgent extends DevelopingAgent<DeveloperVariables> {
  protected buildPrompt(variables: Readonly<DeveloperVariables>): string {
    const excellentRepoSkillPath = this.workspaceRelativePath(variables.excellentRepoSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const paperBlueprintPath = this.workspaceRelativePath(variables.paperBlueprintPath);
    const experimentPlanPath = this.workspaceRelativePath(variables.experimentPlanPath);
    const codingPlanPath = this.workspaceRelativePath(variables.codingPlanPath);
    const reviewerReport = variables.reviewerReport ?? "(none)";
    const excellentRepoSkillInstructionText = excellentRepoSkillInstruction(excellentRepoSkillPath);

    return `
${excellentRepoSkillInstructionText}

Work only in the target repository at ${targetPath}/.

Read:
- paper blueprint: ${paperBlueprintPath}
- experiment plan: ${experimentPlanPath}
- coding plan: ${codingPlanPath}

Current developer task:
${variables.currentTask}

Reviewer report:
${reviewerReport}

Modify the target repository code for the current task. If a reviewer report is present, update the code according to that report.

Do not modify files outside ${targetPath}/.

Output a concise developer report with the main changes.
`;
  }
}
