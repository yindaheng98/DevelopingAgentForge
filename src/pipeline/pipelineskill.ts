import {
  AgentTeam,
  definePipeline,
  type PipelineArgsOptions,
  type PipelineOptions,
  type RecordCallback,
} from "coding-agent-forge";
import type { Agent } from "coding-agent-forge/agent";
import { agentFactories, type TrajectoryOptimizerVariables } from "../agents/index.js";
import type { DevelopmentAgentVariablesByName, DevelopmentCallbacks } from "./development.js";
import { developingArgsOptions, developingPipeline } from "./pipeline.js";

export type DevelopingSkillAgentVariables = DevelopmentAgentVariablesByName & {
  "trajectory-optimizer": TrajectoryOptimizerVariables;
};

export const developingSkillArgsOptions = {
  "metaskill-path": {
    type: "string",
    description: "Metaskill design document used by the trajectory optimizer",
  },
  ...developingArgsOptions,
} as const satisfies PipelineArgsOptions;

export type DevelopingSkillOptions = PipelineOptions<typeof developingSkillArgsOptions>;

export async function developingSkill(
  team: AgentTeam<DevelopingSkillAgentVariables>,
  options: DevelopingSkillOptions,
): Promise<void> {
  const metaskillPath = options["metaskill-path"];
  if (metaskillPath === undefined) {
    throw new Error("--metaskill-path is required");
  }

  const logRecord: RecordCallback = (thread, record) => {
    console.log(thread.recordToPrettyString(record));
  };
  let trajectoryOptimizer: Agent<TrajectoryOptimizerVariables> | undefined;

  const developingOptions = {
    ...options,
    callbacks: {
      onTaskStart: async (agentVariables, currentTask) => {
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
      onTaskFinish: async (agentVariables, currentTask, revisionReports, todoUpdateReport) => {
        if (trajectoryOptimizer === undefined) {
          throw new Error("Trajectory optimizer must scan the repository before optimizing.");
        }

        const revisionReport = revisionReports.join("\n\n");
        const optimizerReport = (
          await trajectoryOptimizer.runStreamed(
            {
              ...agentVariables,
              phase: "optimize",
              currentTask,
              revisionReport,
              todoUpdateReport,
              metaskillPath,
            },
            logRecord,
          )
        ).trim();

        console.log(`\n# Skill trajectory optimizer report\n${optimizerReport}\n`);
      },
    } as const satisfies DevelopmentCallbacks,
  };
  await developingPipeline.run(team, developingOptions);
}

export const developingSkillPipeline = definePipeline({
  name: "developing-skill",
  description: "Run the code development loop and evolve its skill.",
  argsOptions: developingSkillArgsOptions,
  agentFactories,
  async run(
    team: AgentTeam<DevelopingSkillAgentVariables>,
    options: PipelineOptions<typeof developingSkillArgsOptions>,
  ) {
    await developingSkill(team, options);
  },
});
