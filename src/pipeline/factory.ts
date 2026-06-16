import type { AgentFactoryMap } from "coding-agent-forge";
import { createMemoryAgentFactories } from "memory-agent-forge";

import { agentFactories as developingAgentFactories } from "../agents/index.js";

export const agentFactories: AgentFactoryMap = {
  ...developingAgentFactories,
  ...createMemoryAgentFactories(),
};
