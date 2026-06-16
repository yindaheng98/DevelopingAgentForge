import {
  AgentTeam,
  definePipeline,
  type PipelineArgsOptions,
  type PipelineOptions,
  type RecordCallback,
} from "coding-agent-forge";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ProjectDevLoop,
  type ProjectDevLoopAgentVariablesByName,
  type ProjectDevLoopCallbacks,
} from "./project-devloop.js";
import { agentFactories } from "./factory.js";

export type DevelopingOptions = {
  targetPath: string;
  codingStyleSkillPath: string;
  goalPath: string;
  achiveDir: string;
  maxIterations: number;
  maxTaskDevLoopIterations: number;
  memoryPath: string;
  maxMemoryRounds: number;
  callbacks?: ProjectDevLoopCallbacks;
};

export async function developing(
  team: AgentTeam<ProjectDevLoopAgentVariablesByName>,
  options: DevelopingOptions,
): Promise<void> {
  const logRecord: RecordCallback = (thread, record) => {
    console.log(thread.recordToPrettyString(record));
  };

  const goal = await readGoal(options.goalPath);

  await new ProjectDevLoop().develop(
    team,
    options.targetPath,
    options.codingStyleSkillPath,
    goal,
    options.achiveDir,
    options.maxIterations,
    options.maxTaskDevLoopIterations,
    options.memoryPath,
    options.maxMemoryRounds,
    options.callbacks,
    logRecord,
  );
}

async function readGoal(goalPath: string): Promise<string> {
  const goal = (await readFile(path.resolve(goalPath), "utf8")).trim();
  if (goal === "") {
    throw new Error(`Goal file must not be empty: ${goalPath}`);
  }
  return goal;
}

export const developingArgsOptions = {
  "target-path": {
    type: "string",
    description: "Target repository folder to create or modify",
  },
  "coding-style-skill-path": {
    type: "string",
    description: "Coding style skill path used by the agents",
  },
  "goal-path": {
    type: "string",
    description: "Goal document path",
  },
  "achive-dir": {
    type: "string",
    description: "Archive folder for per-iteration reports",
  },
  "max-iterations": {
    type: "string",
    default: "10",
    description: "Maximum number of project dev loop iterations",
  },
  "max-task-dev-loop-iterations": {
    type: "string",
    default: "3",
    description: "Maximum developer/reviewer iterations per project iteration",
  },
  "memory-path": {
    type: "string",
    description: "Memory directory for development continuity",
  },
  "max-memory-rounds": {
    type: "string",
    default: "3",
    description: "Maximum recall and remember refinement rounds",
  },
} as const satisfies PipelineArgsOptions;

export const developingPipeline = definePipeline({
  name: "developing",
  description: "Run the project dev loop.",
  argsOptions: developingArgsOptions,
  agentFactories,
  async run(
    team: AgentTeam<ProjectDevLoopAgentVariablesByName>,
    options: PipelineOptions<typeof developingArgsOptions> & Pick<DevelopingOptions, "callbacks">,
  ) {
    const {
      "target-path": targetPath,
      "coding-style-skill-path": codingStyleSkillPath,
      "goal-path": goalPath,
      "achive-dir": achiveDir,
      "max-iterations": maxIterations,
      "max-task-dev-loop-iterations": maxTaskDevLoopIterations,
      "memory-path": memoryPath,
      "max-memory-rounds": maxMemoryRounds,
      callbacks,
    } = options;
    if (
      targetPath === undefined ||
      codingStyleSkillPath === undefined ||
      goalPath === undefined ||
      achiveDir === undefined ||
      memoryPath === undefined
    ) {
      throw new Error(
        [
          "--target-path",
          "--coding-style-skill-path",
          "--goal-path",
          "--achive-dir",
          "--memory-path",
        ].join(", ") + " are required",
      );
    }

    await developing(team, {
      targetPath,
      codingStyleSkillPath,
      goalPath,
      achiveDir,
      maxIterations: Number(maxIterations),
      maxTaskDevLoopIterations: Number(maxTaskDevLoopIterations),
      memoryPath,
      maxMemoryRounds: Number(maxMemoryRounds),
      ...(callbacks === undefined ? {} : { callbacks }),
    });
  },
});
