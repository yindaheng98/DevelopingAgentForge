import type { AgentFactoryMap } from "coding-agent-forge";

import { DeveloperAgent, type DeveloperVariables } from "./developer.js";
import { CodingManagerAgent, type CodingManagerVariables } from "./manager.js";
import { CodeReviewerAgent, type CodeReviewerVariables } from "./reviewer.js";
import type { DevelopingAgentConstants } from "./types.js";

export type DevelopingAgentFactorySpecByKind = {
  "coding-manager": {
    variables: CodingManagerVariables;
    constants: DevelopingAgentConstants;
  };
  developer: {
    variables: DeveloperVariables;
    constants: DevelopingAgentConstants;
  };
  "code-reviewer": {
    variables: CodeReviewerVariables;
    constants: DevelopingAgentConstants;
  };
};

export const agentFactories: AgentFactoryMap<DevelopingAgentFactorySpecByKind> = {
  "coding-manager": (thread, constants) => new CodingManagerAgent(thread, constants),
  developer: (thread, constants) => new DeveloperAgent(thread, constants),
  "code-reviewer": (thread, constants) => new CodeReviewerAgent(thread, constants),
};
