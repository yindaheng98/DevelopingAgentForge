import { AgentTeam, type RecordCallback } from "coding-agent-forge";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { definePipeline, type ParsedPipelineArgs } from "../pipeline.js";
import { agentFactories, type DeveloperVariables } from "./agents/index.js";

export type DevelopingAgentVariables = {
  developer: DeveloperVariables;
};

export type DevelopingOptions = {
  targetPath: string;
  planPath: string;
  overviewPath: string;
  responsePath: string;
  responseArchivePath: string;
  maxRounds: number;
};

const USAGE =
  "Usage: npm run developing-loop -- --config <path> --coding-plan-path <path> --code-overview-path <path> --response-path <path> --response-archive-path <folder> [--target-path <folder>] [--max-rounds <positive-integer>]";

export function parseDevelopingArgs(
  args: readonly string[],
): ParsedPipelineArgs<DevelopingOptions> {
  const {
    values: {
      config,
      "target-path": targetPath,
      "coding-plan-path": planPath,
      "code-overview-path": overviewPath,
      "response-path": responsePath,
      "response-archive-path": responseArchivePath,
      "max-rounds": maxRounds,
    },
  } = parseArgs({
    args: [...args],
    options: {
      config: { type: "string", multiple: true },
      "target-path": { type: "string" },
      "coding-plan-path": { type: "string" },
      "code-overview-path": { type: "string" },
      "response-path": { type: "string" },
      "response-archive-path": { type: "string" },
      "max-rounds": { type: "string" },
    },
  });

  if (
    config === undefined ||
    planPath === undefined ||
    overviewPath === undefined ||
    responsePath === undefined ||
    responseArchivePath === undefined
  ) {
    throw new Error(USAGE);
  }

  return {
    configPaths: config,
    runningOptions: {
      targetPath: targetPath ?? ".",
      planPath,
      overviewPath,
      responsePath,
      responseArchivePath,
      maxRounds: Number(maxRounds ?? 10),
    },
  };
}

export async function developing(
  team: AgentTeam<DevelopingAgentVariables>,
  options: DevelopingOptions,
): Promise<void> {
  const logRecord: RecordCallback = (thread, record) => {
    console.log(thread.recordToPrettyString(record));
  };

  if (!existsSync(options.overviewPath)) {
    await mkdir(path.dirname(options.overviewPath), { recursive: true });
    await writeFile(options.overviewPath, "# Code Overview\n", "utf8");
  }

  for (let round = 1; round <= options.maxRounds; round++) {
    const previousResponse = existsSync(options.responsePath)
      ? (await readFile(options.responsePath, "utf8")).trim()
      : "";

    console.log(`\n# Developing round ${String(round)}\n`);

    const response = (
      await team.runStreamed(
        "developer",
        {
          targetPath: options.targetPath,
          planPath: options.planPath,
          overviewPath: options.overviewPath,
          previousResponse,
        },
        logRecord,
      )
    ).trim();

    if (response === "Finished") {
      console.log("\n# Finished\n");
      return;
    }

    await mkdir(path.dirname(options.responsePath), { recursive: true });
    await writeFile(options.responsePath, `${response}\n`, "utf8");
    console.log(`\n# Saved response to ${options.responsePath}\n`);

    await mkdir(options.responseArchivePath, { recursive: true });
    const archiveFile = path.join(
      options.responseArchivePath,
      `${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
    );
    await writeFile(archiveFile, `${response}\n`, "utf8");
    console.log(`\n# Archived response to ${archiveFile}\n`);
  }

  throw new Error(
    `Reached --max-rounds ${String(options.maxRounds)} before the agent returned Finished.`,
  );
}

export const developingPipeline = definePipeline({
  agentFactories,
  parseArgs: parseDevelopingArgs,
  run: developing,
});
