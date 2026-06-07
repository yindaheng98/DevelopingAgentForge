import { excellentRepoSkillInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

type SelectCodingManagerVariables = DevelopingAgentVariables & {
  todoPath: string;
  finishMark: string;
  phase: "select";
};

type UpdateCodingManagerVariables = DevelopingAgentVariables & {
  todoPath: string;
  finishMark: string;
  phase: "update";
  currentTask: string;
  revisionReport: string;
};

export type CodingManagerVariables = SelectCodingManagerVariables | UpdateCodingManagerVariables;

export class CodingManagerAgent extends DevelopingAgent<CodingManagerVariables> {
  protected buildPrompt(variables: Readonly<CodingManagerVariables>): string {
    const excellentRepoSkillPath = this.workspaceRelativePath(variables.excellentRepoSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const paperBlueprintPath = this.workspaceRelativePath(variables.paperBlueprintPath);
    const experimentPlanPath = this.workspaceRelativePath(variables.experimentPlanPath);
    const codingPlanPath = this.workspaceRelativePath(variables.codingPlanPath);
    const todoPath = this.workspaceRelativePath(variables.todoPath);
    const excellentRepoSkillInstructionText = excellentRepoSkillInstruction(excellentRepoSkillPath);

    if (variables.phase === "update") {
      return `
${excellentRepoSkillInstructionText}

Update the TODO file after a developer task.
Work only in the TODO file at ${todoPath}. Scan the target repository at ${targetPath}/ before editing it.

Read:
- paper blueprint: ${paperBlueprintPath}
- experiment plan: ${experimentPlanPath}
- coding plan: ${codingPlanPath}

Current developer task:
${variables.currentTask}

Revision report:
${variables.revisionReport}

The revision report lists each Developer report and Reviewer report from the review loop, ending with whether the Reviewer accepted the changes or the loop reached the max revision iterations.

Update ${todoPath} so completed work and future developer tasks match the current repository. If you find a better future plan, update the future plan in ${todoPath}.
`;
    }

    return `
${excellentRepoSkillInstructionText}

Select the next developer task for the target repository.
Scan the target repository at ${targetPath}/ and the TODO file at ${todoPath}.

Read:
- paper blueprint: ${paperBlueprintPath}
- experiment plan: ${experimentPlanPath}
- coding plan: ${codingPlanPath}

Choose exactly one new bounded task for the Developer from ${todoPath}.

When no further developer task is needed, return exactly:
${variables.finishMark}
`;
  }
}
