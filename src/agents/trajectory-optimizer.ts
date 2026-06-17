import { Agent } from "coding-agent-forge/agent";
import { readFileSync } from "node:fs";
import { goalInstruction } from "./prompts.js";
import type { DevelopingAgentVariables } from "./types.js";

type ScanTrajectoryOptimizerVariables = DevelopingAgentVariables & {
  phase: "scan";
  taskBrief: string;
};

type OptimizeTrajectoryOptimizerVariables = DevelopingAgentVariables & {
  phase: "optimize";
  taskBrief: string;
  taskRoundSummary: string;
  metaskillPath: string;
};

export type TrajectoryOptimizerVariables =
  | ScanTrajectoryOptimizerVariables
  | OptimizeTrajectoryOptimizerVariables;

export class TrajectoryOptimizerAgent extends Agent<TrajectoryOptimizerVariables> {
  protected buildPrompt(variables: Readonly<TrajectoryOptimizerVariables>): string {
    const goalInstructionText = goalInstruction(variables.goal);

    switch (variables.phase) {
      case "scan":
        return buildScanPrompt(
          variables.targetPath,
          variables.codingStyleSkillPath,
          goalInstructionText,
          variables.taskBrief,
        );
      case "optimize": {
        const metaskill = readFileSync(variables.metaskillPath, "utf8");
        return buildOptimizePrompt(
          variables.targetPath,
          variables.codingStyleSkillPath,
          goalInstructionText,
          variables.taskBrief,
          variables.taskRoundSummary,
          metaskill,
        );
      }
    }
  }
}

function buildScanPrompt(
  targetPath: string,
  codingStyleSkillPath: string,
  goalInstructionText: string,
  taskBrief: string,
): string {
  return `
Work in the target repository at ${targetPath}/.
Scan the target repository at ${targetPath}/ and the skill at ${codingStyleSkillPath} before the Developer starts the Task Brief. Read only.

${goalInstructionText}

Task Brief:
${taskBrief}

Output a concise baseline of the repository state relevant to this task and the main guidance the skill should provide.
`;
}

function buildOptimizePrompt(
  targetPath: string,
  codingStyleSkillPath: string,
  goalInstructionText: string,
  taskBrief: string,
  taskRoundSummary: string,
  metaskill: string,
): string {
  return `
Revise the skill at ${codingStyleSkillPath} so it produces better development trajectories.

The metaskill below contains the design goals and tips of this skill:

${metaskill}

Read:
- target repository: ${targetPath}
${goalInstructionText}

Task Brief:
${taskBrief}

Reality-aware task round summary:
${taskRoundSummary}

Evaluate whether the skill produced a good modification trajectory, then edit the skill directly. Focus on missing, misleading, or redundant guidance that affected task selection, coding, or review.

Output a concise optimizer report with the main skill changes.
`;
}
