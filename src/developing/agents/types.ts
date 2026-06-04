import type { Thread } from "coding-agent-forge";
import { Agent } from "coding-agent-forge/agent";
import { statSync } from "node:fs";
import path from "node:path";

export type DevelopingCommonVariables = {
  targetPath: string;
  overviewPath: string;
  statePath: string;
  artifactDir: string;
  artifactrAchiveDir: string;
  paperBlueprintPath: string;
  experimentPlanPath: string;
  codingPlanPath: string;
};

export type DevelopingAgentConstants = {
  workspacePath: string;
};

export abstract class DevelopingAgent<Variables extends DevelopingCommonVariables> extends Agent<
  Variables,
  DevelopingAgentConstants
> {
  protected readonly workspacePath: string;

  constructor(thread: Thread, constants: Readonly<DevelopingAgentConstants>) {
    const workspacePath = path.resolve(constants.workspacePath);

    if (!statSync(workspacePath).isDirectory()) {
      throw new Error(`workspacePath must be a directory: ${workspacePath}`);
    }

    super(thread, { ...constants, workspacePath });
    this.workspacePath = workspacePath;
  }

  protected workspaceRelativePath(filePath: string): string {
    return path.relative(this.workspacePath, path.resolve(filePath)) || ".";
  }
}
