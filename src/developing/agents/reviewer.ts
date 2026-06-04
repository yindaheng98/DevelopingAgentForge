import { DEVELOPING_CONTRACT, REPORT_HEADER } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type CodeReviewerVariables = DevelopingAgentVariables & {
  currentTask: string;
  developerReport: string;
  testReport: string;
  harnessReport: string;
};

export class CodeReviewerAgent extends DevelopingAgent<CodeReviewerVariables> {
  protected buildPrompt(variables: Readonly<CodeReviewerVariables>): string {
    const codingPlanPath = this.workspaceRelativePath(variables.codingPlanPath);
    const statePath = this.workspaceRelativePath(variables.statePath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);

    return `
${DEVELOPING_CONTRACT}

Review the current code and reports for code quality and maintainability risks.
Paths are relative to the configured workspace path.
Read only. Do not modify files.
Review the current code and reports for:
- maintainability
- module boundaries
- interface consistency
- hidden coupling
- error handling
- replaceable methods and baselines
- whether paper logic is hard-coded into tests or harness code

Inputs:
- target codebase: ${targetPath}
- coding plan: ${codingPlanPath}
- implementation state: ${statePath}

Current task:
${variables.currentTask}

Developer report:
${variables.developerReport}

Test report:
${variables.testReport}

Harness report:
${variables.harnessReport}

Output the review content in your response. Lead with blocking issues if any; the pipeline will save your response as the review artifact.

${REPORT_HEADER}
`;
  }
}
