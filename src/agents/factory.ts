import type { AgentFactoryMap } from "coding-agent-forge";

import { DeveloperAgent } from "./developer.js";
import { CodingManagerAgent } from "./manager.js";
import { CodeReviewerAgent } from "./reviewer.js";
import { TrajectoryOptimizerAgent } from "./trajectory-optimizer.js";

export const agentFactories: AgentFactoryMap = {
  "coding-manager": (thread, constants) => new CodingManagerAgent(thread, constants),
  developer: (thread, constants) => new DeveloperAgent(thread, constants),
  "code-reviewer": (thread, constants) => new CodeReviewerAgent(thread, constants),
  "trajectory-optimizer": (thread, constants) => new TrajectoryOptimizerAgent(thread, constants),
};
