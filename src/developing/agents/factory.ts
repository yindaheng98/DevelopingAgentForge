import type { AgentFactoryMap } from "coding-agent-forge";

import { ExperimentContractAuditorAgent } from "./auditor.js";
import { DeveloperAgent } from "./developer.js";
import { CodingPlanInterpreterAgent } from "./interpreter.js";
import { IntegrationManagerAgent } from "./manager.js";
import { CodeReviewerAgent } from "./reviewer.js";
import { HarnessEngineerAgent } from "./harness.js";

export const agentFactories: AgentFactoryMap = {
  "coding-plan-interpreter": (thread, constants) =>
    new CodingPlanInterpreterAgent(thread, constants),
  developer: (thread, constants) => new DeveloperAgent(thread, constants),
  "harness-engineer": (thread, constants) => new HarnessEngineerAgent(thread, constants),
  "code-reviewer": (thread, constants) => new CodeReviewerAgent(thread, constants),
  "experiment-contract-auditor": (thread, constants) =>
    new ExperimentContractAuditorAgent(thread, constants),
  "integration-manager": (thread, constants) => new IntegrationManagerAgent(thread, constants),
};
