import { DEVELOPING_CONTRACT } from "./prompts.js";
import { DevelopingAgent, type DevelopingAgentVariables } from "./types.js";

export type IntegrationManagerVariables = DevelopingAgentVariables & {
  currentTask: string;
  developerReport: string;
  testReport: string;
  harnessReport: string;
  review: string;
  audit: string;
  nextDeveloperTaskPath: string;
};

export class IntegrationManagerAgent extends DevelopingAgent<IntegrationManagerVariables> {
  protected buildPrompt(variables: Readonly<IntegrationManagerVariables>): string {
    const paperBlueprintPath = this.workspaceRelativePath(variables.paperBlueprintPath);
    const experimentPlanPath = this.workspaceRelativePath(variables.experimentPlanPath);
    const nextDeveloperTaskPath = this.workspaceRelativePath(variables.nextDeveloperTaskPath);
    const overviewPath = this.workspaceRelativePath(variables.overviewPath);
    const codingPlanPath = this.workspaceRelativePath(variables.codingPlanPath);
    const statePath = this.workspaceRelativePath(variables.statePath);
    const targetPath = this.workspaceRelativePath(variables.targetPath);

    return `
${DEVELOPING_CONTRACT}

Integrate the reports, update developing state, and decide whether the loop is finished.
Paths are relative to the configured workspace path.
You own state and handoff artifacts. Do not modify source code, tests, harness code, configs, or package files.

Read:
- target codebase: ${targetPath}
- coding plan: ${codingPlanPath}
- paper blueprint: ${paperBlueprintPath}
- experiment plan: ${experimentPlanPath}
- implementation state: ${statePath}
- code overview: ${overviewPath}

Current task:
${variables.currentTask}

Developer report:
${variables.developerReport}

Test report:
${variables.testReport}

Harness report:
${variables.harnessReport}

Review:
${variables.review}

Contract audit:
${variables.audit}

Update these files directly:
- ${statePath}
- ${overviewPath}
- ${nextDeveloperTaskPath}

implementation_state.md must keep stable task IDs, status, claim/experiment/metric linkage, files, acceptance commands, and verification evidence.
code_overview.md must describe modules, CLI, tests, harness, raw result layout, and freeze protocol when known.
next_developer_task.md must contain a concrete next selected task unless the work is finished.

Return exactly:
Finished

only when all required coding_plan work is verified or explicitly waived, unit/fixture/CLI smoke checks pass or are waived with reason, harness smoke emits parseable raw results or is waived with reason, and contract_audit.md has no blocking issue.

Otherwise return a concise developing-response.md handoff that names the next task and any blockers. Developer does not decide Finished; only you do.
`;
  }
}
