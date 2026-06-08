import { type AgentFactoryMap, AgentTeam, type RecordCallback } from "coding-agent-forge";
import type { Agent } from "coding-agent-forge/agent";
import { parseArgs } from "node:util";
import { definePipeline, type ParsedPipelineArgs } from "../pipeline.js";
import {
  agentFactories as developingAgentFactories,
  TrajectoryOptimizerAgent,
  type TrajectoryOptimizerVariables,
} from "./agents/index.js";
import {
  developing,
  type DevelopingAgentVariablesByName,
  type DevelopingOptions,
} from "./pipeline.js";

export type DevelopingSkillAgentVariables = DevelopingAgentVariablesByName & {
  "trajectory-optimizer": TrajectoryOptimizerVariables;
};

export type DevelopingSkillOptions = DevelopingOptions & {
  metaskillPath: string;
};

const USAGE = [
  "Usage: npm run developing-skill --",
  "--config <path>",
  "--target-path <folder>",
  "--achive-dir <folder>",
  "--todo-path <path>",
  "--coding-style-skill-path <path>",
  "--metaskill-path <path>",
  "--paper-blueprint-path <path>",
  "--experiment-plan-path <path>",
  "--coding-plan-path <path>",
  "[--max-iterations <positive-integer>]",
  "[--max-revision-iterations <positive-integer>]",
].join(" ");

export function parseDevelopingSkillArgs(
  args: readonly string[],
): ParsedPipelineArgs<DevelopingSkillOptions> {
  const {
    values: {
      config,
      "target-path": targetPath,
      "achive-dir": achiveDir,
      "todo-path": todoPath,
      "coding-style-skill-path": codingStyleSkillPath,
      "metaskill-path": metaskillPath,
      "paper-blueprint-path": paperBlueprintPath,
      "experiment-plan-path": experimentPlanPath,
      "coding-plan-path": codingPlanPath,
      "max-iterations": maxIterations,
      "max-revision-iterations": maxRevisionIterations,
    },
  } = parseArgs({
    args: [...args],
    options: {
      config: { type: "string", multiple: true },
      "target-path": { type: "string" },
      "achive-dir": { type: "string" },
      "todo-path": { type: "string" },
      "coding-style-skill-path": { type: "string" },
      "metaskill-path": { type: "string" },
      "paper-blueprint-path": { type: "string" },
      "experiment-plan-path": { type: "string" },
      "coding-plan-path": { type: "string" },
      "max-iterations": { type: "string" },
      "max-revision-iterations": { type: "string" },
    },
  });

  if (
    config === undefined ||
    targetPath === undefined ||
    achiveDir === undefined ||
    todoPath === undefined ||
    codingStyleSkillPath === undefined ||
    metaskillPath === undefined ||
    paperBlueprintPath === undefined ||
    experimentPlanPath === undefined ||
    codingPlanPath === undefined
  ) {
    throw new Error(USAGE);
  }

  return {
    configPaths: config,
    runningOptions: {
      targetPath,
      achiveDir,
      todoPath,
      codingStyleSkillPath,
      metaskillPath,
      paperBlueprintPath,
      experimentPlanPath,
      codingPlanPath,
      maxIterations: Number(maxIterations ?? 10),
      maxRevisionIterations: Number(maxRevisionIterations ?? 3),
    },
  };
}

export async function developingSkill(
  team: AgentTeam<DevelopingSkillAgentVariables>,
  options: DevelopingSkillOptions,
): Promise<void> {
  const logRecord: RecordCallback = (thread, record) => {
    console.log(thread.recordToPrettyString(record));
  };
  let trajectoryOptimizer: Agent<TrajectoryOptimizerVariables> | undefined;

  await developing(team, {
    ...options,
    hooks: {
      beforeRevisionLoop: async (agentVariables, currentTask) => {
        trajectoryOptimizer = await team.createAgent("trajectory-optimizer");
        const repositoryScan = (
          await trajectoryOptimizer.runStreamed(
            {
              ...agentVariables,
              phase: "scan",
              currentTask,
            },
            logRecord,
          )
        ).trim();
        console.log(`\n# Skill trajectory repository scan\n${repositoryScan}\n`);
      },
      afterTodoUpdate: async (agentVariables, currentTask, revisionReport, todoUpdateReport) => {
        if (trajectoryOptimizer === undefined) {
          throw new Error("Trajectory optimizer must scan the repository before optimizing.");
        }

        const optimizerReport = (
          await trajectoryOptimizer.runStreamed(
            {
              ...agentVariables,
              phase: "optimize",
              currentTask,
              revisionReport,
              todoUpdateReport,
              metaskillPath: options.metaskillPath,
            },
            logRecord,
          )
        ).trim();

        console.log(`\n# Skill trajectory optimizer report\n${optimizerReport}\n`);
      },
    },
  });
}

export const developingSkillAgentFactories: AgentFactoryMap = {
  ...developingAgentFactories,
  "trajectory-optimizer": (thread, constants) => new TrajectoryOptimizerAgent(thread, constants),
};

export const developingSkillPipeline = definePipeline({
  agentFactories: developingSkillAgentFactories,
  parseArgs: parseDevelopingSkillArgs,
  run: developingSkill,
});
