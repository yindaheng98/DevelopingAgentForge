import {
  AgentTeam,
  definePipeline,
  type PipelineArgsOptions,
  type PipelineOptions,
} from "coding-agent-forge";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ProjectDevLoop,
  type ProjectDevLoopAgentVariablesByName,
  type ProjectDevLoopCallbacks,
} from "./project-devloop.js";
import { agentFactories } from "./factory.js";
import type { DevelopingAgentFactorySpecByKind } from "../agents/index.js";

export type DevelopingOptions = {
  targetPath: string;
  goalPath: string[];
  archiveRoot: string;
  maxIterations: number;
  maxTaskDevLoopIterations: number;
  projectProgressMemoryPath: string;
  codeDesignMemoryPath: string;
  maxMemoryRounds: number;
  memoryCleanInterval: number;
  callbacks?: ProjectDevLoopCallbacks;
};

export async function developing(
  team: AgentTeam<ProjectDevLoopAgentVariablesByName, DevelopingAgentFactorySpecByKind>,
  options: DevelopingOptions,
): Promise<void> {
  const goal = await readGoal(options.goalPath);

  await new ProjectDevLoop().develop(
    team,
    options.targetPath,
    goal,
    options.archiveRoot,
    options.maxIterations,
    options.maxTaskDevLoopIterations,
    options.projectProgressMemoryPath,
    options.codeDesignMemoryPath,
    options.maxMemoryRounds,
    options.memoryCleanInterval,
    options.callbacks,
  );
}

async function readGoal(goalPaths: string[]): Promise<string> {
  if (goalPaths.length === 0) {
    throw new Error("--goal-path is required");
  }

  const goals: string[] = [];
  for (const goalPath of goalPaths) {
    const goal = (await readFile(path.resolve(goalPath), "utf8")).trim();
    if (goal === "") {
      throw new Error(`Goal file must not be empty: ${goalPath}`);
    }
    goals.push(goal);
  }
  return goals.join("\n\n");
}

export const developingArgsOptions = {
  "target-path": {
    type: "string",
    description: "Target repository folder to create or modify",
  },
  "goal-path": {
    type: "string",
    multiple: true,
    description: "Goal document path; repeat to concatenate multiple goals in order",
  },
  "archive-root": {
    type: "string",
    description: "Archive root folder for per-iteration reports",
  },
  "max-iterations": {
    type: "string",
    default: "10",
    description: "Maximum number of project iterations",
  },
  "max-task-devloop-iterations": {
    type: "string",
    default: "3",
    description: "Maximum developer/reviewer attempts per selected task",
  },
  "project-progress-memory-path": {
    type: "string",
    description: "Memory directory for project progress continuity",
  },
  "code-design-memory-path": {
    type: "string",
    description: "Memory directory for code design continuity",
  },
  "max-memory-rounds": {
    type: "string",
    default: "3",
    description: "Maximum recall and remember refinement rounds",
  },
  "memory-clean-interval": {
    type: "string",
    default: "1",
    description: "Project iterations between memory clean runs; 0 disables automatic clean",
  },
} as const satisfies PipelineArgsOptions;

export const developingPipeline = definePipeline({
  name: "developing",
  description: "Run the project development workflow.",
  argsOptions: developingArgsOptions,
  agentFactories,
  async run(
    team: AgentTeam<ProjectDevLoopAgentVariablesByName, DevelopingAgentFactorySpecByKind>,
    options: PipelineOptions<typeof developingArgsOptions> & Pick<DevelopingOptions, "callbacks">,
  ) {
    const {
      "target-path": targetPath,
      "goal-path": goalPath,
      "archive-root": archiveRoot,
      "max-iterations": maxIterations,
      "max-task-devloop-iterations": maxTaskDevLoopIterations,
      "project-progress-memory-path": projectProgressMemoryPath,
      "code-design-memory-path": codeDesignMemoryPath,
      "max-memory-rounds": maxMemoryRounds,
      "memory-clean-interval": memoryCleanInterval,
      callbacks,
    } = options;
    if (
      targetPath === undefined ||
      goalPath === undefined ||
      archiveRoot === undefined ||
      projectProgressMemoryPath === undefined ||
      codeDesignMemoryPath === undefined
    ) {
      throw new Error(
        [
          "--target-path",
          "--goal-path",
          "--archive-root",
          "--project-progress-memory-path",
          "--code-design-memory-path",
        ].join(", ") + " are required",
      );
    }

    await developing(team, {
      targetPath,
      goalPath,
      archiveRoot,
      maxIterations: Number(maxIterations),
      maxTaskDevLoopIterations: Number(maxTaskDevLoopIterations),
      projectProgressMemoryPath,
      codeDesignMemoryPath,
      maxMemoryRounds: Number(maxMemoryRounds),
      memoryCleanInterval: Number(memoryCleanInterval),
      ...(callbacks === undefined ? {} : { callbacks }),
    });
  },
});
