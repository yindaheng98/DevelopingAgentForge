import { AgentTeam, type RecordCallback } from "coding-agent-forge";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { definePipeline, type ParsedPipelineArgs } from "../pipeline.js";
import {
  agentFactories,
  type CodingManagerVariables,
  type CodeReviewerVariables,
  type DeveloperVariables,
} from "./agents/index.js";
import type { DevelopingAgentVariables } from "./agents/types.js";

export type DevelopingAgentVariablesByName = {
  "coding-manager": CodingManagerVariables;
  developer: DeveloperVariables;
  "code-reviewer": CodeReviewerVariables;
};

export type DevelopingOptions = {
  targetPath: string;
  achiveDir: string;
  todoPath: string;
  excellentRepoSkillPath: string;
  paperBlueprintPath: string;
  experimentPlanPath: string;
  codingPlanPath: string;
  maxIterations: number;
  reviewRevisions: number;
};

const USAGE = [
  "Usage: npm run developing --",
  "--config <path>",
  "--target-path <folder>",
  "--achive-dir <folder>",
  "--todo-path <path>",
  "--excellent-repo-skill-path <path>",
  "--paper-blueprint-path <path>",
  "--experiment-plan-path <path>",
  "--coding-plan-path <path>",
  "[--max-iterations <positive-integer>]",
  "[--review-revisions <positive-integer>]",
].join(" ");

const FINISH_MARK = "FINISHED";
const ACCEPT_MARK = "ACCEPT";

export function parseDevelopingArgs(
  args: readonly string[],
): ParsedPipelineArgs<DevelopingOptions> {
  const {
    values: {
      config,
      "target-path": targetPath,
      "achive-dir": achiveDir,
      "todo-path": todoPath,
      "excellent-repo-skill-path": excellentRepoSkillPath,
      "paper-blueprint-path": paperBlueprintPath,
      "experiment-plan-path": experimentPlanPath,
      "coding-plan-path": codingPlanPath,
      "max-iterations": maxIterations,
      "review-revisions": reviewRevisions,
    },
  } = parseArgs({
    args: [...args],
    options: {
      config: { type: "string", multiple: true },
      "target-path": { type: "string" },
      "achive-dir": { type: "string" },
      "todo-path": { type: "string" },
      "excellent-repo-skill-path": { type: "string" },
      "paper-blueprint-path": { type: "string" },
      "experiment-plan-path": { type: "string" },
      "coding-plan-path": { type: "string" },
      "max-iterations": { type: "string" },
      "review-revisions": { type: "string" },
    },
  });

  if (
    config === undefined ||
    targetPath === undefined ||
    achiveDir === undefined ||
    todoPath === undefined ||
    excellentRepoSkillPath === undefined ||
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
      excellentRepoSkillPath,
      paperBlueprintPath,
      experimentPlanPath,
      codingPlanPath,
      maxIterations: Number(maxIterations ?? 10),
      reviewRevisions: Number(reviewRevisions ?? 3),
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

  const achiveDir = path.resolve(options.achiveDir);
  const todoPath = path.resolve(options.todoPath);
  const agentVariables: DevelopingAgentVariables = {
    targetPath: path.resolve(options.targetPath),
    excellentRepoSkillPath: path.resolve(options.excellentRepoSkillPath),
    paperBlueprintPath: path.resolve(options.paperBlueprintPath),
    experimentPlanPath: path.resolve(options.experimentPlanPath),
    codingPlanPath: path.resolve(options.codingPlanPath),
  };

  await mkdir(achiveDir, { recursive: true });
  if (!existsSync(todoPath)) {
    await writeText(todoPath, "# TODO");
  }

  for (let iteration = 1; iteration <= options.maxIterations; iteration++) {
    console.log(`\n# Developing iteration ${String(iteration)}\n`);
    const archiveDir = path.join(achiveDir, new Date().toISOString().replace(/[:.]/g, "-"));
    await mkdir(archiveDir, { recursive: true });

    const codingManager = await team.createAgent("coding-manager");
    const developer = await team.createAgent("developer");
    const codeReviewer = await team.createAgent("code-reviewer");

    const currentTask = (
      await codingManager.runStreamed(
        {
          ...agentVariables,
          todoPath,
          finishMark: FINISH_MARK,
          phase: "select",
        },
        logRecord,
      )
    ).trim();
    await writeText(path.join(archiveDir, "current_task.md"), currentTask);

    if (currentTask.trim() === FINISH_MARK) {
      console.log(`\n# ${FINISH_MARK}\n`);
      return;
    }

    let reviewerReport = "";
    let developerReport = "";

    for (let revision = 1; revision <= options.reviewRevisions; revision++) {
      console.log(`\n# Review revision ${String(revision)}\n`);

      const developerVariables: DeveloperVariables = {
        ...agentVariables,
        currentTask,
      };
      if (reviewerReport) {
        developerVariables.reviewerReport = reviewerReport;
      }

      developerReport = (await developer.runStreamed(developerVariables, logRecord)).trim();
      await writeText(
        path.join(archiveDir, `developer_report_${String(revision).padStart(3, "0")}.md`),
        developerReport,
      );

      const review = (
        await codeReviewer.runStreamed(
          {
            ...agentVariables,
            acceptMark: ACCEPT_MARK,
            currentTask,
            developerReport,
          },
          logRecord,
        )
      ).trim();
      await writeText(
        path.join(archiveDir, `code_review_${String(revision).padStart(3, "0")}.md`),
        review,
      );

      if (review.trim() === ACCEPT_MARK) {
        await writeText(path.join(archiveDir, "accepted_task.md"), currentTask);
        break;
      }

      reviewerReport = review;
    }

    const todoUpdateReport = (
      await codingManager.runStreamed(
        {
          ...agentVariables,
          todoPath,
          finishMark: FINISH_MARK,
          phase: "update",
          acceptedTask: currentTask,
          developerReport,
        },
        logRecord,
      )
    ).trim();
    await writeText(path.join(archiveDir, "todo_update_report.md"), todoUpdateReport);
  }

  throw new Error(
    `Reached --max-iterations ${String(options.maxIterations)} before the coding-manager returned ${FINISH_MARK}.`,
  );
}

async function writeText(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${content.trimEnd()}\n`, "utf8");
}

export const developingPipeline = definePipeline({
  agentFactories,
  parseArgs: parseDevelopingArgs,
  run: developing,
});
