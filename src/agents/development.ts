import type { AgentTeam, RecordCallback } from "coding-agent-forge";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CodingManagerVariables } from "./manager.js";
import { Revision, type RevisionAgentVariablesByName } from "./revision.js";
import type { DevelopingAgentVariables } from "./types.js";

export type DevelopmentAgentVariablesByName = RevisionAgentVariablesByName & {
  "coding-manager": CodingManagerVariables;
};

export type DevelopmentInerationCallback = (
  agentVariables: DevelopingAgentVariables,
  currentTask: string,
  revisionReports: readonly string[],
  todoUpdateReport: string,
) => Promise<void> | void;

const FINISH_MARK = "FINISHED";

export class Development {
  async develop(
    team: AgentTeam<DevelopmentAgentVariablesByName>,
    targetPath: string,
    achiveDir: string,
    artifactPath: string,
    codingStyleSkillPath: string,
    goal: string,
    maxIterations: number,
    maxRevisionIterations: number,
    iterationCallback?: DevelopmentInerationCallback,
    logRecord?: RecordCallback,
  ): Promise<void> {
    const resolvedAchiveDir = path.resolve(achiveDir);
    const resolvedArtifactPath = path.resolve(artifactPath);
    const todoPath = path.join(resolvedArtifactPath, "TODO.md");
    const agentVariables: DevelopingAgentVariables = {
      targetPath: path.resolve(targetPath),
      codingStyleSkillPath: path.resolve(codingStyleSkillPath),
      goal,
    };
    const revision = new Revision();

    await mkdir(resolvedAchiveDir, { recursive: true });
    await mkdir(resolvedArtifactPath, { recursive: true });
    if (!existsSync(todoPath)) {
      await writeFile(todoPath, "# TODO", "utf8");
    }
    await mkdir(agentVariables.targetPath, { recursive: true });

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      console.log(`\n# Developing iteration ${String(iteration)}\n`);
      const archiveDir = path.join(
        resolvedAchiveDir,
        new Date().toISOString().replace(/[:.]/g, "-"),
      );
      await mkdir(archiveDir, { recursive: true });

      const codingManager = await team.createAgent("coding-manager");

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
      await writeFile(path.join(archiveDir, "current_task.md"), currentTask, "utf8");

      if (currentTask.trim() === FINISH_MARK) {
        console.log(`\n# ${FINISH_MARK}\n`);
        return;
      }

      const revisionReports = await revision.revise(
        team,
        agentVariables.targetPath,
        agentVariables.codingStyleSkillPath,
        agentVariables.goal,
        archiveDir,
        maxRevisionIterations,
        currentTask,
        logRecord,
      );

      const todoUpdateReport = (
        await codingManager.runStreamed(
          {
            ...agentVariables,
            todoPath,
            finishMark: FINISH_MARK,
            phase: "update",
            currentTask,
            revisionReport: revisionReports.join("\n\n"),
          },
          logRecord,
        )
      ).trim();
      await writeFile(path.join(archiveDir, "todo_update_report.md"), todoUpdateReport, "utf8");

      await iterationCallback?.(agentVariables, currentTask, revisionReports, todoUpdateReport);
    }

    throw new Error(
      `Reached --max-iterations ${String(maxIterations)} before the coding-manager returned ${FINISH_MARK}.`,
    );
  }
}
