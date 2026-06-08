import { Agent } from "coding-agent-forge/agent";
import { readFileSync } from "node:fs";
import type { DevelopingAgentVariables } from "./types.js";

type ScanTrajectoryOptimizerVariables = DevelopingAgentVariables & {
  phase: "scan";
  currentTask: string;
};

type OptimizeTrajectoryOptimizerVariables = DevelopingAgentVariables & {
  phase: "optimize";
  currentTask: string;
  revisionReport: string;
  todoUpdateReport: string;
  metaskillPath: string;
};

export type TrajectoryOptimizerVariables =
  | ScanTrajectoryOptimizerVariables
  | OptimizeTrajectoryOptimizerVariables;

export class TrajectoryOptimizerAgent extends Agent<TrajectoryOptimizerVariables> {
  protected buildPrompt(variables: Readonly<TrajectoryOptimizerVariables>): string {
    if (variables.phase === "scan") {
      return `
Read only. Scan the target repository before the Developer starts the current task.

Read:
- skill: ${variables.codingStyleSkillPath}
- target repository: ${variables.targetPath}
- paper blueprint: ${variables.paperBlueprintPath}
- experiment plan: ${variables.experimentPlanPath}
- coding plan: ${variables.codingPlanPath}

Current developer task:
${variables.currentTask}

Output a concise baseline of the repository state relevant to this task and the main guidance the skill should provide.
`;
    }

    const metaskill = readFileSync(variables.metaskillPath, "utf8");
    return `
Revise the skill at ${variables.codingStyleSkillPath} so it produces better development trajectories.

The metaskill below contains the design goals and tips of this skill:

${metaskill}

Read:
- target repository: ${variables.targetPath}
- paper blueprint: ${variables.paperBlueprintPath}
- experiment plan: ${variables.experimentPlanPath}
- coding plan: ${variables.codingPlanPath}

Current developer task:
${variables.currentTask}

Revision report:
${variables.revisionReport}

TODO update report:
${variables.todoUpdateReport}

Evaluate whether the skill produced a good modification trajectory, then edit the skill directly. Focus on missing, misleading, or redundant guidance that affected task selection, coding, review, or TODO update.

Output a concise optimizer report with the main skill changes.
`;
  }
}
