import type { AgentFactoryMap } from "coding-agent-forge";

import { DeveloperAgent } from "./developer.js";

export const agentFactories: AgentFactoryMap = {
  developer: (thread, constants) => {
    if (!constants.workspacePath) {
      throw new Error("developer constants.workspacePath must be configured.");
    }
    return new DeveloperAgent(thread, {
      workspacePath: constants.workspacePath,
    });
  },
};
