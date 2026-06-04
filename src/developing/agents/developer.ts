import { DEVELOPING_CONTRACT, REPORT_HEADER } from "./prompts.js";
import {
  DevelopingAgent,
  type DevelopingAgentConstants,
  type DevelopingAgentVariables,
} from "./types.js";

export type DeveloperVariables = DevelopingAgentVariables & {
  currentTaskPath: string;
  previousFeedbackPath?: string;
};

export type DeveloperConstants = DevelopingAgentConstants;

export class DeveloperAgent extends DevelopingAgent<DeveloperVariables> {
  private optionalWorkspaceRelativePath(filePath: string | undefined): string {
    return filePath === undefined ? "(none)" : this.workspaceRelativePath(filePath);
  }

  protected buildPrompt(variables: Readonly<DeveloperVariables>): string {
    const paperBlueprintPath = this.workspaceRelativePath(variables.paperBlueprintPath);
    const currentTaskPath = this.workspaceRelativePath(variables.currentTaskPath);
    const experimentPlanPath = this.workspaceRelativePath(variables.experimentPlanPath);
    const overviewPath = this.workspaceRelativePath(variables.overviewPath);
    const codingPlanPath = this.workspaceRelativePath(variables.codingPlanPath);
    const previousFeedbackPath = this.optionalWorkspaceRelativePath(variables.previousFeedbackPath);
    const statePath = this.workspaceRelativePath(variables.statePath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);

    return `
${DEVELOPING_CONTRACT}

Implement the selected developing task.
Paths are relative to the configured workspace path.
Work in the codebase at ${targetPath}.
Read:
- paper blueprint: ${paperBlueprintPath}
- experiment plan: ${experimentPlanPath}
- coding plan: ${codingPlanPath}
- code overview: ${overviewPath}
- implementation state: ${statePath}
- current task: ${currentTaskPath}
- previous next-task handoff, if present: ${previousFeedbackPath}

Implement exactly the task described in current_task.md.
Do not choose a different task.
Do not redo verified work from implementation_state.md.
Do not modify metric definitions, claim mapping, or freeze rules unless current_task.md explicitly requires it.
Keep testing and harness code separate.
If the current task is already fully implemented, do not modify code; report the evidence.
If tests fail due to unrelated pre-existing failures, isolate and report them.

Do not update ${overviewPath}; IntegrationManager owns it.
Do not return Finished. Output the complete developer_report.md contents.

${REPORT_HEADER}
`;
  }
}
