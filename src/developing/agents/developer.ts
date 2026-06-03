import type { Thread } from "coding-agent-forge";
import { Agent } from "coding-agent-forge/agent";
import { statSync } from "node:fs";
import path from "node:path";

export type DeveloperVariables = {
  targetPath: string;
  planPath: string;
  overviewPath: string;
  previousResponse: string;
};

export type DeveloperConstants = {
  workspacePath: string;
};

export class DeveloperAgent extends Agent<DeveloperVariables, DeveloperConstants> {
  constructor(thread: Thread, constants: Readonly<DeveloperConstants>) {
    const workspacePath = path.resolve(constants.workspacePath);

    if (!statSync(workspacePath).isDirectory()) {
      throw new Error(`workspacePath must be a directory: ${workspacePath}`);
    }

    super(thread, { ...constants, workspacePath });
  }

  protected buildPrompt(
    variables: Readonly<DeveloperVariables>,
    constants: Readonly<DeveloperConstants>,
  ): string {
    const workspacePath = constants.workspacePath;
    const absoluteTargetPath = path.isAbsolute(variables.targetPath)
      ? path.resolve(variables.targetPath)
      : path.resolve(workspacePath, variables.targetPath);
    const absolutePlanPath = path.isAbsolute(variables.planPath)
      ? path.resolve(variables.planPath)
      : path.resolve(workspacePath, variables.planPath);
    const absoluteOverviewPath = path.isAbsolute(variables.overviewPath)
      ? path.resolve(variables.overviewPath)
      : path.resolve(workspacePath, variables.overviewPath);

    if (!statSync(absolutePlanPath).isFile()) {
      throw new Error(`planPath must be a file: ${absolutePlanPath}`);
    }
    if (!statSync(absoluteOverviewPath).isFile()) {
      throw new Error(`overviewPath must be a file: ${absoluteOverviewPath}`);
    }

    const targetPath = path.relative(workspacePath, absoluteTargetPath);
    const planPath = path.relative(workspacePath, absolutePlanPath);
    const overviewPath = path.relative(workspacePath, absoluteOverviewPath);
    const previousResponse = variables.previousResponse.trim();
    const taskInstruction = previousResponse
      ? `The previous response from the last round is below:

${previousResponse}

Treat the previous response as the handoff from the last round. It may contain completed work, remaining work, implementation notes, caveats, and suggested next steps.
Reconcile that handoff with the current code, the coding plan, and the code overview. Then choose and implement one important unfinished feature from the coding plan.
Do not redo work that is already implemented unless it is necessary to fix or complete it.`
      : "Implement one core unfinished feature from the coding plan.";

    return `
Work in the codebase at ${targetPath}.
Read the coding plan at ${planPath}, the code overview at ${overviewPath}, and the current codebase.

${taskInstruction}

Update the code overview concisely. Besides modifying or adding descriptions of implemented behavior, explain how the implemented feature can support future features. Future plans may not predict the simplest and clearest code design, so revise unreasonable future-feature notes when needed.

At the end, if there are no more features from the coding plan left to implement, your final response must be exactly:
Finished

Otherwise, briefly state what is now implemented and what should be implemented next.
`;
  }
}
