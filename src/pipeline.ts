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
  Development,
  agentFactories,
  type DevelopmentAgentVariablesByName,
  type DevelopmentInerationCallback,
} from "./agents/index.js";

export type DevelopingOptions = {
  targetPath: string;
  achiveDir: string;
  artifactPath: string;
  codingStyleSkillPath: string;
  goalPath: string;
  maxIterations: number;
  maxRevisionIterations: number;
  iterationCallback?: DevelopmentInerationCallback;
};

export async function developing(
  team: AgentTeam<DevelopmentAgentVariablesByName>,
  options: DevelopingOptions,
): Promise<void> {
  const logRecord: RecordCallback = (thread, record) => {
    console.log(thread.recordToPrettyString(record));
  };

  const goal = await readGoal(options.goalPath);

  await new Development().develop(
    team,
    options.targetPath,
    options.achiveDir,
    options.artifactPath,
    options.codingStyleSkillPath,
    goal,
    options.maxIterations,
    options.maxRevisionIterations,
    options.iterationCallback,
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
  "achive-dir": {
    type: "string",
    description: "Archive folder for per-iteration reports",
  },
  "artifact-path": {
    type: "string",
    description: "Working artifact folder containing TODO.md",
  },
  "coding-style-skill-path": {
    type: "string",
    description: "Coding style skill path used by the agents",
  },
  "goal-path": {
    type: "string",
    description: "Goal document path",
  },
  "max-iterations": {
    type: "string",
    default: "10",
    description: "Maximum number of development iterations",
  },
  "max-revision-iterations": {
    type: "string",
    default: "3",
    description: "Maximum review revisions per development iteration",
  },
} as const satisfies PipelineArgsOptions;

export const developingPipeline = definePipeline({
  name: "developing",
  description: "Run the code development loop.",
  argsOptions: developingArgsOptions,
  agentFactories,
  async run(
    team: AgentTeam<DevelopmentAgentVariablesByName>,
    options: PipelineOptions<typeof developingArgsOptions> & Pick<DevelopingOptions, "iterationCallback">,
  ) {
    const {
      "target-path": targetPath,
      "achive-dir": achiveDir,
      "artifact-path": artifactPath,
      "coding-style-skill-path": codingStyleSkillPath,
      "goal-path": goalPath,
      "max-iterations": maxIterations,
      "max-revision-iterations": maxRevisionIterations,
      iterationCallback,
    } = options;
    if (
      targetPath === undefined ||
      achiveDir === undefined ||
      artifactPath === undefined ||
      codingStyleSkillPath === undefined ||
      goalPath === undefined
    ) {
      throw new Error(
        [
          "--target-path",
          "--achive-dir",
          "--artifact-path",
          "--coding-style-skill-path",
          "--goal-path",
        ].join(", ") + " are required",
      );
    }

    await developing(team, {
      targetPath,
      achiveDir,
      artifactPath,
      codingStyleSkillPath,
      goalPath,
      maxIterations: Number(maxIterations),
      maxRevisionIterations: Number(maxRevisionIterations),
      ...(iterationCallback === undefined ? {} : { iterationCallback }),
    });
  },
});
