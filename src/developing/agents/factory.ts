import type { AgentFactoryMap } from "coding-agent-forge";

import { CodingPlanInterpreterAgent } from "./interpreter.js";
import { DeveloperAgent } from "./developer.js";
import { HarnessEngineerAgent } from "./harness.js";
import { CodeReviewerAgent } from "./reviewer.js";
import { ExperimentContractAuditorAgent } from "./auditor.js";
import { IntegrationManagerAgent } from "./manager.js";

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
