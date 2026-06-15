import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
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
    const codingStyleSkillPath = this.workspaceRelativePath(variables.codingStyleSkillPath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);
    const todoPath = this.workspaceRelativePath(variables.todoPath);
    const codingStyleSkillInstructionText = codingStyleSkillInstruction(codingStyleSkillPath);
    const goalInstructionText = goalInstruction(variables.goal);

    if (variables.phase === "update") {
      return `
${codingStyleSkillInstructionText}

Update the TODO file after a developer task.
Work in the TODO file at ${todoPath}. Scan the target repository at ${targetPath}/ before editing it.

${goalInstructionText}

Current developer task:
${variables.currentTask}

Revision report:
${variables.revisionReport}

The revision report lists each Developer report and Reviewer report from the review loop, ending with whether the Reviewer accepted the changes or the loop reached the max revision iterations.

Update the TODO so completed work and future developer tasks match the current repository. If you find a better future plan, update it too.
`;
    }

    return `
${codingStyleSkillInstructionText}

Select the next developer task for the target repository.
Scan the target repository at ${targetPath}/ and the TODO file at ${todoPath}.

${goalInstructionText}

Choose exactly one new bounded task for the Developer.

When no further developer task is needed, return exactly:
${variables.finishMark}
`;
  }
}
