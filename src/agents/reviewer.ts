import { codingStyleSkillInstruction, goalInstruction } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type CodeReviewerVariables = DevelopingAgentVariables & {
  taskBrief: string;
  developerReport: string;
  codeDesignMemory: string;
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

Task Brief:
${variables.taskBrief}

Related code design memory:
${variables.codeDesignMemory}

Developer report:
${variables.developerReport}

Review the Developer's result using the Task Brief, Developer report, and code design memory.

Focus on:
- whether the Objective is actually improved
- whether the evidence supports the Developer's claims
- whether the code quality and design remain healthy
- whether the change respects existing code relationships and design memory
- whether the next action should be revision, manager redirection, or acceptance

On the first non-empty line, output exactly one decision:
ACCEPT
REVISE
REDIRECT

Use ACCEPT when the result is good enough.
Use REVISE when the Developer can improve the result within the same task direction.
Use REDIRECT when the task direction, scope, dependency, or premise should be reconsidered by the Manager.

After the decision, give concise feedback unless ACCEPT. Also list any reusable memory candidates.
`
    );
  }
}
