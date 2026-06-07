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
  maxRevisionIterations: number;
  hooks?: DevelopingHooks;
};

export type DevelopingHooks = {
  beforeRevisionLoop?: (
    agentVariables: DevelopingAgentVariables,
    currentTask: string,
  ) => Promise<void> | void;
  afterRevision?: (
    revision: number,
    agentVariables: DevelopingAgentVariables,
    currentTask: string,
    developerReport: string,
    reviewerReport: string,
    revisionReports: readonly string[],
  ) => Promise<void> | void;
  afterTodoUpdate?: (
    agentVariables: DevelopingAgentVariables,
    currentTask: string,
    revisionReport: string,
    todoUpdateReport: string,
  ) => Promise<void> | void;
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
  "[--max-revision-iterations <positive-integer>]",
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
      "max-revision-iterations": maxRevisionIterations,
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
      "max-revision-iterations": { type: "string" },
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
      maxRevisionIterations: Number(maxRevisionIterations ?? 3),
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
  await mkdir(agentVariables.targetPath, { recursive: true });

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

    let previousReviewerReport = "";
    const revisionReports: string[] = [];

    await options.hooks?.beforeRevisionLoop?.(agentVariables, currentTask);

    for (let revision = 1; revision <= options.maxRevisionIterations; revision++) {
      console.log(`\n# Review revision ${String(revision)}\n`);

      const developerVariables: DeveloperVariables = {
        ...agentVariables,
        currentTask,
      };
      if (previousReviewerReport) {
        developerVariables.reviewerReport = previousReviewerReport;
      }

      const developerReport = (await developer.runStreamed(developerVariables, logRecord)).trim();
      await writeText(
        path.join(archiveDir, `developer_report_${String(revision).padStart(3, "0")}.md`),
        developerReport,
      );
      revisionReports.push(`Developer report ${String(revision)}:\n${developerReport}`);

      const reviewerReport = (
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
        reviewerReport,
      );
      revisionReports.push(`Reviewer report ${String(revision)}:\n${reviewerReport}`);

      const accepted = reviewerReport.trim() === ACCEPT_MARK;
      if (accepted) {
        revisionReports.push("Reviewer accepted the changes.");
      }

      if (!accepted && revision === options.maxRevisionIterations) {
        revisionReports.push("Reviewer did not accept the changes before max revision iterations.");
      }

      await options.hooks?.afterRevision?.(
        revision,
        agentVariables,
        currentTask,
        developerReport,
        reviewerReport,
        revisionReports,
      );
      if (accepted) {
        break;
      }
      previousReviewerReport = reviewerReport;
    }

    const revisionReport = revisionReports.join("\n\n");
    await writeText(path.join(archiveDir, "revision_report.md"), revisionReport);

    const todoUpdateReport = (
      await codingManager.runStreamed(
        {
          ...agentVariables,
          todoPath,
          finishMark: FINISH_MARK,
          phase: "update",
          currentTask,
          revisionReport,
        },
        logRecord,
      )
    ).trim();
    await writeText(path.join(archiveDir, "todo_update_report.md"), todoUpdateReport);

    await options.hooks?.afterTodoUpdate?.(
      agentVariables,
      currentTask,
      revisionReport,
      todoUpdateReport,
    );
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
