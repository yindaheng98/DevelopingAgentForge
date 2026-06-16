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
  revisionReport: string;
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

    if (variables.phase === "recall") {
      return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Current task:
${variables.currentTask}

Scan the target repository at ${targetPath}/ and decide what code design memory helps complete the current task.

Output concise code design memory recall guidance.
`;
    }

    if (variables.phase === "update") {
      return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Current task:
${variables.currentTask}

Related code design memory before the current task:
${variables.memory}

Review revision process for completing the current task:
${variables.revisionReport}

Scan the target repository at ${targetPath}/ and consider what code logic relationships and design reasons should be remembered after the current task.

Remember code logic relationships and why the current design matches the repository.
`;
    }

    const reviewerReport = variables.reviewerReport ?? "(none)";
    return `
${codingStyleSkillInstructionText}

${goalInstructionText}

Related code design memory:
${variables.memory}

Work in the target repository at ${targetPath}/.

Current task:
${variables.currentTask}

Reviewer report:
${reviewerReport}

Modify the target repository code for the current task. If a reviewer report is present, update the code according to that report.

Output a concise developer report with the main changes.
`;
  }
}
