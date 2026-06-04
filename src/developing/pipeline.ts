import { AgentTeam, type RecordCallback } from "coding-agent-forge";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { definePipeline, type ParsedPipelineArgs } from "../pipeline.js";
import {
  agentFactories,
  type CodingPlanInterpreterVariables,
  type DeveloperVariables,
  type HarnessEngineerVariables,
  type CodeReviewerVariables,
  type ExperimentContractAuditorVariables,
  type IntegrationManagerVariables,
} from "./agents/index.js";
import type { DevelopingAgentVariables } from "./agents/types.js";

export type DevelopingAgentVariablesByName = {
  "coding-plan-interpreter": CodingPlanInterpreterVariables;
  developer: DeveloperVariables;
  "harness-engineer": HarnessEngineerVariables;
  "code-reviewer": CodeReviewerVariables;
  "experiment-contract-auditor": ExperimentContractAuditorVariables;
  "integration-manager": IntegrationManagerVariables;
};

export type DevelopingOptions = {
  targetPath: string;
  artifactDir: string;
  artifactrAchiveDir: string;
  paperBlueprintPath: string;
  experimentPlanPath: string;
  codingPlanPath: string;
  maxIterations: number;
};

const USAGE =
  "Usage: npm run developing -- --config <path> --target-path <folder> --artifact-dir <folder> --artifact-archive-dir <folder> --paper-blueprint-path <path> --experiment-plan-path <path> --coding-plan-path <path> [--max-iterations <positive-integer>]";

export function parseDevelopingArgs(
  args: readonly string[],
): ParsedPipelineArgs<DevelopingOptions> {
  const {
    values: {
      config,
      "target-path": targetPath,
      "artifact-dir": artifactDir,
      "artifact-archive-dir": artifactrAchiveDir,
      "paper-blueprint-path": paperBlueprintPath,
      "experiment-plan-path": experimentPlanPath,
      "coding-plan-path": codingPlanPath,
      "max-iterations": maxIterations,
    },
  } = parseArgs({
    args: [...args],
    options: {
      config: { type: "string", multiple: true },
      "target-path": { type: "string" },
      "artifact-dir": { type: "string" },
      "artifact-archive-dir": { type: "string" },
      "paper-blueprint-path": { type: "string" },
      "experiment-plan-path": { type: "string" },
      "coding-plan-path": { type: "string" },
      "max-iterations": { type: "string" },
    },
  });

  if (
    config === undefined ||
    targetPath === undefined ||
    artifactDir === undefined ||
    artifactrAchiveDir === undefined ||
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
      artifactDir,
      artifactrAchiveDir,
      paperBlueprintPath,
      experimentPlanPath,
      codingPlanPath,
      maxIterations: Number(maxIterations ?? 10),
    },
  };
}

export async function developing(
  team: AgentTeam<DevelopingAgentVariablesByName>,
  options: DevelopingOptions,
): Promise<void> {
  const logRecord: RecordCallback = (thread, record) => {
    console.log(thread.recordToPrettyString(record));
  };

  const artifactDir = path.resolve(options.artifactDir);
  const artifactrAchiveDir = path.resolve(options.artifactrAchiveDir);
  const agentVariables: DevelopingAgentVariables = {
    targetPath: path.resolve(options.targetPath),
    overviewPath: path.join(artifactDir, "code_overview.md"),
    statePath: path.join(artifactDir, "implementation_state.md"),
    paperBlueprintPath: path.resolve(options.paperBlueprintPath),
    experimentPlanPath: path.resolve(options.experimentPlanPath),
    codingPlanPath: path.resolve(options.codingPlanPath),
  };
  const responsePath = path.join(artifactDir, "developer_response.md");
  const nextDeveloperTaskPath = path.join(artifactDir, "next_developer_task.md");
  await mkdir(artifactDir, { recursive: true });

  if (!existsSync(agentVariables.overviewPath)) {
    await mkdir(path.dirname(agentVariables.overviewPath), { recursive: true });
    await writeFile(agentVariables.overviewPath, "# Code Overview\n", "utf8");
  }

  if (!existsSync(agentVariables.statePath)) {
    await writeFile(
      agentVariables.statePath,
      "# Implementation State\n\nNo tasks recorded yet.\n",
      "utf8",
    );
  }

  let previousReview = "";
  let previousAudit = "";
  let previousHarnessReport = "";

  for (let iteration = 1; iteration <= options.maxIterations; iteration++) {
    console.log(`\n# Developing iteration ${String(iteration)}\n`);
    const archiveDir = path.join(
      artifactrAchiveDir,
      new Date().toISOString().replace(/[:.]/g, "-"),
    );
    await mkdir(archiveDir, { recursive: true });

    const interpreterVariables: CodingPlanInterpreterVariables = { ...agentVariables };
    if (previousReview) interpreterVariables.previousReview = previousReview;
    if (previousAudit) interpreterVariables.previousAudit = previousAudit;
    if (previousHarnessReport) interpreterVariables.previousHarnessReport = previousHarnessReport;

    const task = (
      await team.runStreamed("coding-plan-interpreter", interpreterVariables, logRecord)
    ).trim();
    await writeFile(path.join(archiveDir, "current_task.md"), `${task}\n`, "utf8");

    const developerVariables: DeveloperVariables = {
      ...agentVariables,
      currentTask: task,
    };
    if (existsSync(nextDeveloperTaskPath)) {
      developerVariables.previousFeedback = (await readFile(nextDeveloperTaskPath, "utf8")).trim();
    }

    const developerReport = (
      await team.runStreamed("developer", developerVariables, logRecord)
    ).trim();
    await writeFile(path.join(archiveDir, "developer_report.md"), `${developerReport}\n`, "utf8");

    const harnessReport = (
      await team.runStreamed(
        "harness-engineer",
        {
          ...agentVariables,
          currentTask: task,
          developerReport,
        },
        logRecord,
      )
    ).trim();
    await writeFile(path.join(archiveDir, "harness_report.md"), `${harnessReport}\n`, "utf8");

    const [review, audit] = await Promise.all([
      team.runStreamed(
        "code-reviewer",
        {
          ...agentVariables,
          currentTask: task,
          developerReport,
          harnessReport,
        },
        logRecord,
      ),
      team.runStreamed(
        "experiment-contract-auditor",
        {
          ...agentVariables,
          currentTask: task,
          developerReport,
          harnessReport,
        },
        logRecord,
      ),
    ]);
    const reviewText = review.trim();
    const auditText = audit.trim();
    await writeFile(path.join(archiveDir, "review.md"), `${reviewText}\n`, "utf8");
    await writeFile(path.join(archiveDir, "contract_audit.md"), `${auditText}\n`, "utf8");

    const decision = (
      await team.runStreamed(
        "integration-manager",
        {
          ...agentVariables,
          currentTask: task,
          developerReport,
          harnessReport,
          review: reviewText,
          audit: auditText,
          nextDeveloperTaskPath,
        },
        logRecord,
      )
    ).trim();

    await writeFile(path.join(archiveDir, "release_decision.md"), `${decision}\n`, "utf8");
    await writeFile(responsePath, `${decision}\n`, "utf8");
    if (decision !== "Finished") {
      await writeFile(nextDeveloperTaskPath, `${decision}\n`, "utf8");
    }
    console.log(`\n# Saved response to ${responsePath}\n`);
    const archiveFile = path.join(archiveDir, "developing-response.md");
    await writeFile(archiveFile, `${decision}\n`, "utf8");
    console.log(`\n# Archived response to ${archiveFile}\n`);

    if (decision === "Finished") {
      console.log("\n# Finished\n");
      return;
    }

    previousReview = reviewText;
    previousAudit = auditText;
    previousHarnessReport = harnessReport;
  }

  throw new Error(
    `Reached --max-iterations ${String(options.maxIterations)} before the agent returned Finished.`,
  );
}

export const developingPipeline = definePipeline({
  agentFactories,
  parseArgs: parseDevelopingArgs,
  run: developing,
});
