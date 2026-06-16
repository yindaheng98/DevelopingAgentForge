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
  revisionReport: string;
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

    if (variables.phase === "recall") {
      return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Scan the target repository at ${targetPath}/ and decide what memory helps select the next task for the current goal.

Output concise memory recall guidance.
`;
    }

    if (variables.phase === "update") {
      return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Scan the target repository at ${targetPath}/ and consider what should be remembered after a developer task.

Related memory before this task:
${variables.memory}

Current developer task:
${variables.currentTask}

Revision report:
${variables.revisionReport}

The revision report lists each Developer report and Reviewer report from the review loop, ending with whether the Reviewer accepted the changes or the loop reached the max revision iterations.

Remember completed work and current repository state.
`;
    }

    return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Related memory:
${variables.memory}

Scan the target repository at ${targetPath}/ and read the memory related to the current goal.
Select the next developer task for the target repository.

Choose exactly one new bounded task for the Developer.

When no further developer task is needed, return exactly:
${variables.finishMark}
`;
  }
}
