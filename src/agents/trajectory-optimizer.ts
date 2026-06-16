import { Agent } from "coding-agent-forge/agent";
import { readFileSync } from "node:fs";
import { goalInstruction } from "./prompts.js";
import type { DevelopingAgentVariables } from "./types.js";

type ScanTrajectoryOptimizerVariables = DevelopingAgentVariables & {
  phase: "scan";
  currentTask: string;
};

type OptimizeTrajectoryOptimizerVariables = DevelopingAgentVariables & {
  phase: "optimize";
  currentTask: string;
  taskDevReport: string;
  metaskillPath: string;
};

export type TrajectoryOptimizerVariables =
  | ScanTrajectoryOptimizerVariables
  | OptimizeTrajectoryOptimizerVariables;

export class TrajectoryOptimizerAgent extends Agent<TrajectoryOptimizerVariables> {
  protected buildPrompt(variables: Readonly<TrajectoryOptimizerVariables>): string {
    const goalInstructionText = goalInstruction(variables.goal);

    if (variables.phase === "scan") {
      return `
Work in the target repository at ${variables.targetPath}/.
Scan the target repository at ${variables.targetPath}/ and the skill at ${variables.codingStyleSkillPath} before the Developer starts the current task. Read only.

${goalInstructionText}

Current developing task:
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
${goalInstructionText}

Current developing task:
${variables.currentTask}

Revision process for completing the developing task:
${variables.taskDevReport}

Evaluate whether the skill produced a good modification trajectory, then edit the skill directly. Focus on missing, misleading, or redundant guidance that affected task selection, coding, or review.

Output a concise optimizer report with the main skill changes.
`;
  }
}
