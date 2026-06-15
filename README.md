# Developing Pipeline

[`src`](src) implements a goal-driven code-writing loop.

[中文说明](README.zh-CN.md)

## What This Pipeline Does

The usual entry point is [`develop.sh`](develop.sh), which calls `npm run developing` with paths for:

- the goal file passed with `--goal-path`
- `skills/coding-style/SKILL.md`
- the artifact directory containing `TODO.md`
- the target codebase directory
- the development archive directory, passed through the current CLI option name `--achive-dir`

The pipeline works in the configured `--target-path`, reads the current high-level objective from `--goal-path`, maintains `TODO.md` under the configured `--artifact-path`, and archives per-iteration task/review artifacts under the configured archive directory.

The package exposes a TypeScript API from [`src/index.ts`](src/index.ts) and a CLI from [`src/cli.ts`](src/cli.ts).

## Core Idea: Developing And Coding Style

`src` turns the current goal into a repeatable code-writing trajectory. `coding-manager` reads the current repository, the goal, and `TODO.md`, chooses one concrete developer task, `developer` edits the target repository, and `code-reviewer` either returns `ACCEPT` or sends revision feedback back into the same task.

The coding-style skill is [`skills/coding-style/SKILL.md`](skills/coding-style/SKILL.md). Its job is to control the code-writing agent's code structure and style. The upstream user task decides what to implement; this skill decides how to keep the implementation readable, local, low-coupling, and consistent with the current framework.

Every developer run loads the configured coding-style skill through `--coding-style-skill-path`. [`agents/developer.ts`](src/agents/developer.ts) prepends the instruction from [`agents/prompts.ts`](src/agents/prompts.ts): load and follow that skill before reading the repository, current goal, context documents named by the goal, and current task. That makes the writing agent use the same code-structure and style preferences across features, refactors, harness/test work, exports, and framework docs.

`coding-style` is generic for code-writing tasks. It does not decide task priority or repository template initialization. It only keeps code concise, readable, low-friction, easy to modify, and aligned with the existing repository structure.

Put durable code-structure and style preferences in [`metaskills/coding-style/METASKILL.md`](metaskills/coding-style/METASKILL.md), then run [`develop-skill.sh`](develop-skill.sh) from the repository root to update the skill.

## Quick Start

From the repository root, run the prepared wrapper:

```bash
bash develop.sh
```

Use the wrapper with the conventional project paths listed above to write code under `output/codebase`.

Before each new task, update the current goal file:

```bash
$EDITOR output/goal.md
bash develop.sh
```

The prepared wrapper passes `--goal-path "output/goal.md"`. Use that file to describe the next high-level task you want the development loop to pursue.

## TypeScript Development

This repository follows the same npm-based framework as `memory-forge` and `agent-forge`.

```bash
npm ci
npm run check
npm run lint
npm run format:check
npm run build
```

For local CLI development, use `npm run dev -- developing ...` or the prepared `npm run developing` and `npm run developing-skill` script aliases.

## Goal File And Temporary TODO Context

`developing` and `developing-skill` now both accept `--goal-path <path>`. The pipeline reads that file once at the start of the run and passes its contents to `coding-manager`, `developer`, `code-reviewer`, and `trajectory-optimizer` as the current high-level objective.

Each time you want to execute the next new task, update the file passed to `--goal-path` before rerunning [`develop.sh`](develop.sh) or [`develop-skill.sh`](develop-skill.sh). Put any stable project contract, task context paths, constraints, or task focus directly in that goal file.

`TODO.md` under the configured `--artifact-path` is the current temporary task-memory file maintained by `coding-manager`. If the existing TODO content starts to mix old and new task context, you can manually delete the current TODO file, for example `output/developing/TODO.md`, before the next run. The pipeline will recreate an empty TODO file automatically.

This `TODO.md` workflow is a temporary memory mechanism. A more advanced memory mechanism should replace or extend it later, so treat the current file as a practical bridge for task continuity rather than the final long-term memory design.

## Direct Command

`develop.sh` calls:

```bash
npm run developing -- \
  --config "developing-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --artifact-path "output/developing" \
  --coding-style-skill-path "skills/coding-style" \
  --goal-path "output/goal.md" \
  --max-iterations "100" \
  --max-revision-iterations "10"
```

The current CLI option name is `--achive-dir`.

## Options Reference

| Option                      | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `--config`                  | One or more YAML config files loaded with `coding-agent-forge`.       |
| `--target-path`             | Target codebase directory.                                            |
| `--achive-dir`              | Development archive directory.                                        |
| `--artifact-path`           | Artifact directory containing `TODO.md`.                              |
| `--coding-style-skill-path` | Configured coding-style skill.                                        |
| `--goal-path`               | Markdown file containing the current objective and task context.      |
| `--max-iterations`          | Stops the outer loop if `coding-manager` has not returned `FINISHED`. |
| `--max-revision-iterations` | Limits the inner developer/reviewer repair loop.                      |

## Main Flow

[`pipeline.ts`](src/pipeline.ts) parses CLI options and repeats an outer coding-manager task loop with an inner developer/reviewer repair loop.

Each iteration does the following:

1. `coding-manager` scans the current repository, the goal from `--goal-path`, and `TODO.md` in the artifact directory, then chooses one developer task.
2. `developer` loads the configured coding-style skill, edits the repository, and reports what changed for review.
3. `code-reviewer` reads the code and developer report, then returns exactly `ACCEPT` or revision feedback.
4. If the reviewer returns feedback, `developer` fixes the same task and `code-reviewer` reviews again.
5. After the review loop ends, the pipeline archives the task and reports, then asks `coding-manager` to update the TODO file.
6. The pipeline stops when `coding-manager` returns `FINISHED` or `--max-iterations` is reached.

## Developing-Skill And Trajectory Feedback

[`develop-skill.sh`](develop-skill.sh) calls the related `developing-skill` pipeline in [`pipelineskill.ts`](src/pipelineskill.ts). It runs the same development loop, adds `--metaskill-path`, and invokes `trajectory-optimizer` before the revision loop and after TODO updates so the coding-style skill can be improved from concrete development feedback.

The first `trajectory-optimizer` call runs in `scan` mode before the developer starts. It reads the target repository, the current coding-style skill, and the goal context so the optimizer has the same project context as the code-writing loop.

The second `trajectory-optimizer` call runs in `optimize` mode after the TODO update report is produced. It reads the metaskill, target repository, goal context, current task, revision report, and TODO update report; evaluates whether the skill produced a good modification trajectory; then edits the coding-style skill directly. The prompt focuses the optimizer on missing, misleading, or redundant guidance that affected task selection, coding, review, or TODO update.

The intended loop is:

1. Add code-style preferences, failure modes, and review tips to [`metaskills/coding-style/METASKILL.md`](metaskills/coding-style/METASKILL.md).
2. Run `bash develop-skill.sh`.
3. Let `developer`, `code-reviewer`, `coding-manager`, and `trajectory-optimizer` expose where the current skill helped or failed.
4. Inspect the updated [`skills/coding-style/SKILL.md`](skills/coding-style/SKILL.md), keep the useful changes, and repeat when new code-style preferences appear.

This is the coding-style version of skill self-improvement: the metaskill states what "good style guidance" means, the trajectory records how the agent actually modified code, and `develop-skill` uses that evidence to make the reusable skill more precise over time.

## Output Artifacts

The pipeline maintains:

| Artifact                    | Where it lives                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TODO.md`                   | Under the configured artifact directory; the temporary coding-manager-maintained task-memory file.                  |
| Timestamped archive folders | Under the configured archive directory; contains each selected task, per-revision reports, and TODO update reports. |

## Important Files

| Path                                                                   | Purpose                                                                                   |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`pipeline.ts`](src/pipeline.ts)                                       | Argument parsing, loop orchestration, archive creation, and per-agent handoff.            |
| [`pipelineskill.ts`](src/pipelineskill.ts)                             | `developing-skill` wrapper that adds trajectory optimization hooks around the base loop.  |
| [`agents/factory.ts`](src/agents/factory.ts)                           | Registers the developing coding manager, developer, and reviewer agents.                  |
| [`agents/types.ts`](src/agents/types.ts)                               | Shared workspace-aware base class and variables.                                          |
| [`agents/manager.ts`](src/agents/manager.ts)                           | Maintains the TODO file and selects outer-loop tasks.                                     |
| [`agents/developer.ts`](src/agents/developer.ts)                       | Edits the target repository using the shared coding-style skill.                          |
| [`agents/reviewer.ts`](src/agents/reviewer.ts)                         | Performs the read-only code review gate.                                                  |
| [`agents/trajectory-optimizer.ts`](src/agents/trajectory-optimizer.ts) | Scans the trajectory and proposes coding-style skill improvements for `developing-skill`. |

## Troubleshooting

| Problem                                  | Likely cause                                                       | Fix                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| The loop stops with `FINISHED`           | `coding-manager` decided no further developer task is needed.      | Inspect `TODO.md` in the artifact directory and the latest archive.                               |
| A task keeps returning revision feedback | The inner developer/reviewer repair loop has not reached `ACCEPT`. | Read the per-revision reports in the timestamped archive folder.                                  |
| A new goal keeps inheriting old context  | The temporary `TODO.md` still contains old task state.             | Update `--goal-path`; if needed, delete `output/developing/TODO.md` before rerunning the wrapper. |
| The archive option looks misspelled      | The current CLI option name is `--achive-dir`.                     | Use the current option name until the CLI changes.                                                |
