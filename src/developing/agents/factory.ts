import type { AgentFactoryMap } from "coding-agent-forge";

import { DeveloperAgent } from "./developer.js";
import { OrchestratorAgent } from "./orchestrator.js";
import { CodeReviewerAgent } from "./reviewer.js";

export const agentFactories: AgentFactoryMap = {
  orchestrator: (thread, constants) => new OrchestratorAgent(thread, constants),
  developer: (thread, constants) => new DeveloperAgent(thread, constants),
  "code-reviewer": (thread, constants) => new CodeReviewerAgent(thread, constants),
};
