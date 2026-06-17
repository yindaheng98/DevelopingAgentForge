# Developing Pipeline

[`src`](src) implements a goal-driven code-writing loop.

[中文说明](README.zh-CN.md)

## What This Pipeline Does

The usual entry point is [`develop.sh`](develop.sh), which calls `npm run developing` with paths for:

- the goal file passed with `--goal-path`
- `skills/coding-style/SKILL.md`
- the project progress memory directory passed with `--project-progress-memory-path`
- the code design memory directory passed with `--code-design-memory-path`
- the target codebase directory
- the development archive directory, passed through the current CLI option name `--achive-dir`

The pipeline works in the configured `--target-path`, reads the current high-level objective from `--goal-path`, recalls and updates project progress memory under `--project-progress-memory-path`, recalls and updates code design memory under `--code-design-memory-path`, and archives per-iteration task/review artifacts under the configured archive directory.

The package exposes a TypeScript API from [`src/index.ts`](src/index.ts) and a CLI from [`src/cli.ts`](src/cli.ts).

## Core Idea: Developing And Coding Style

`src` turns the current goal into a repeatable code-writing trajectory. `coding-manager` reads the current repository, the goal, and remembered context, writes one bounded Task Brief or `FINISHED`, `developer` edits the target repository, and `code-reviewer` returns `ACCEPT`, `REVISE`, or `REDIRECT`.

The coding-style skill is [`skills/coding-style/SKILL.md`](skills/coding-style/SKILL.md). Its job is to control the code-writing agent's code structure and style. The upstream user task decides what to implement; this skill decides how to keep the implementation readable, local, low-coupling, and consistent with the current framework.

Every developer run loads the configured coding-style skill through `--coding-style-skill-path`. [`agents/developer.ts`](src/agents/developer.ts) prepends the instruction from [`agents/prompts.ts`](src/agents/prompts.ts): load and follow that skill before reading the repository, current goal, context documents named by the goal, and Task Brief. That makes the writing agent use the same code-structure and style preferences across features, refactors, harness/test work, exports, and framework docs.

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

## Goal File And Memory Context

`developing` and `developing-skill` both accept `--goal-path <path>`. The pipeline reads that file once at the start of the run and passes its contents to `coding-manager`, `developer`, `code-reviewer`, and `trajectory-optimizer` as the current high-level objective.

Each time you want to execute the next new task, update the file passed to `--goal-path` before rerunning [`develop.sh`](develop.sh) or [`develop-skill.sh`](develop-skill.sh). Put any stable project contract, task context paths, constraints, or task focus directly in that goal file.

The configured `--project-progress-memory-path` stores project progress memory used by `coding-manager` for task selection and project continuity. The configured `--code-design-memory-path` stores code design memory used by `developer` while completing the selected task. If old context is no longer useful, delete or edit the memory files under the relevant directory before rerunning the pipeline.

## Direct Command

`develop.sh` calls:

```bash
npm run developing -- \
  --config "developing-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --project-progress-memory-path "output/developing/project-progress-memory" \
  --code-design-memory-path "output/developing/code-design-memory" \
  --coding-style-skill-path "skills/coding-style" \
  --goal-path "output/goal.md" \
  --max-iterations "100" \
  --max-task-devloop-iterations "10" \
  --max-memory-rounds "3"
```

The current CLI option name is `--achive-dir`.

## Options Reference

| Option                           | Description                                                           |
| -------------------------------- | --------------------------------------------------------------------- |
| `--config`                       | One or more YAML config files loaded with `coding-agent-forge`.       |
| `--target-path`                  | Target codebase directory.                                            |
| `--achive-dir`                   | Project development archive directory.                                |
| `--project-progress-memory-path` | Memory directory used for project progress continuity.                |
| `--code-design-memory-path`      | Memory directory used for code design continuity.                     |
| `--coding-style-skill-path`      | Configured coding-style skill.                                        |
| `--goal-path`                    | Markdown file containing the current objective and task context.      |
| `--max-iterations`               | Stops the outer loop if `coding-manager` has not returned `FINISHED`. |
| `--max-task-devloop-iterations`  | Limits developer/reviewer attempts for each selected task.            |
| `--max-memory-rounds`            | Limits memory recall and remember refinement rounds.                  |

## Main Flow

[`pipeline/pipeline.ts`](src/pipeline/pipeline.ts) parses CLI options and delegates the project development workflow to [`pipeline/project-devloop.ts`](src/pipeline/project-devloop.ts).

Each iteration does the following:

1. `coding-manager` decides what should be recalled, the pipeline recalls the matching memory, then `coding-manager` scans the current repository, the goal from `--goal-path`, and remembered context before writing one Markdown Task Brief or `FINISHED`. If its select output does not start with `FINISHED` or `# Task Brief`, the manager agent asks the same thread to correct the format.
2. `developer` loads the configured coding-style skill, edits the repository, and reports what changed for review.
3. `code-reviewer` reads the Task Brief, Developer report, and recalled code-design memory, then returns `ACCEPT`, `REVISE`, or `REDIRECT`. If its output does not start with one of those decisions, the reviewer agent asks the same thread to correct the format.
4. `REVISE` sends feedback back to `developer`; `REDIRECT` returns control to `coding-manager`; `ACCEPT` finishes the task.
5. After the review loop ends, the pipeline archives the full transcript, writes `task_round_summary.md` with the Task Brief, final decision, and Developer/Reviewer report text, asks the memory update prompts what should be remembered, and stores that content through `memory-agent-forge`.
6. On the next project iteration, `coding-manager` receives the previous `task_round_summary.md` content as `lastTaskRoundSummary` during recall and task selection, so a `REDIRECT` can directly guide the next Task Brief.
7. The pipeline stops when `coding-manager` returns `FINISHED` or `--max-iterations` is reached.

## Developing-Skill And Trajectory Feedback

[`develop-skill.sh`](develop-skill.sh) calls the related `developing-skill` pipeline in [`pipeline/pipelineskill.ts`](src/pipeline/pipelineskill.ts). It runs the same project development workflow, adds `--metaskill-path`, and invokes `trajectory-optimizer` before and after the developer/reviewer loop so the coding-style skill can be improved from concrete development feedback.

The first `trajectory-optimizer` call runs in `scan` mode before the developer starts. It reads the target repository, the current coding-style skill, and the goal context so the optimizer has the same project context as the code-writing loop.

The second `trajectory-optimizer` call runs in `optimize` mode after the iteration finishes. It reads the metaskill, target repository, goal context, Task Brief, and task round summary; evaluates whether the skill produced a good modification trajectory; then edits the coding-style skill directly. The prompt focuses the optimizer on missing, misleading, or redundant guidance that affected task selection, coding, or review.

The intended loop is:

1. Add code-style preferences, failure modes, and review tips to [`metaskills/coding-style/METASKILL.md`](metaskills/coding-style/METASKILL.md).
2. Run `bash develop-skill.sh`.
3. Let `developer`, `code-reviewer`, `coding-manager`, and `trajectory-optimizer` expose where the current skill helped or failed.
4. Inspect the updated [`skills/coding-style/SKILL.md`](skills/coding-style/SKILL.md), keep the useful changes, and repeat when new code-style preferences appear.

This is the coding-style version of skill self-improvement: the metaskill states what "good style guidance" means, the trajectory records how the agent actually modified code, and `develop-skill` uses that evidence to make the reusable skill more precise over time.

## Output Artifacts

The pipeline maintains:

| Artifact                    | Where it lives                                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Memory files                | Under the configured project progress and code design memory directories; maintained by `memory-agent-forge`.                                                                       |
| Timestamped archive folders | Under the configured archive directory; contains each Task Brief, memory recall guidance, recalled memory, Developer reports, Reviewer feedback, summaries, and things to remember. |

## Important Files

| Path                                                                   | Purpose                                                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`pipeline/pipeline.ts`](src/pipeline/pipeline.ts)                     | CLI argument parsing and the base `developing` pipeline wrapper.                                                         |
| [`pipeline/project-devloop.ts`](src/pipeline/project-devloop.ts)       | Outer project workflow, archive creation, memory recall/update, last task summary handoff, and per-agent coordination.   |
| [`pipeline/task-devloop.ts`](src/pipeline/task-devloop.ts)             | Inner developer/reviewer loop for one selected task.                                                                     |
| [`pipeline/pipelineskill.ts`](src/pipeline/pipelineskill.ts)           | `developing-skill` wrapper that adds trajectory optimization callbacks around the base loop.                             |
| [`agents/factory.ts`](src/agents/factory.ts)                           | Registers the developing coding manager, developer, and reviewer agents.                                                 |
| [`agents/types.ts`](src/agents/types.ts)                               | Shared workspace-aware base class and variables.                                                                         |
| [`agents/manager.ts`](src/agents/manager.ts)                           | Decides what to recall, selects outer-loop tasks, validates select output format, and outputs what should be remembered. |
| [`agents/developer.ts`](src/agents/developer.ts)                       | Edits the target repository using the shared coding-style skill.                                                         |
| [`agents/reviewer.ts`](src/agents/reviewer.ts)                         | Performs the read-only code review gate, validates review output format, and returns `ACCEPT`, `REVISE`, or `REDIRECT`.  |
| [`agents/trajectory-optimizer.ts`](src/agents/trajectory-optimizer.ts) | Scans the trajectory and proposes coding-style skill improvements for `developing-skill`.                                |

## Troubleshooting

| Problem                                 | Likely cause                                                      | Fix                                                                                              |
| --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| The loop stops with `FINISHED`          | `coding-manager` decided no further developing task is needed.    | Inspect the memory directory and the latest archive.                                             |
| A task keeps returning `REVISE`         | The inner developer/reviewer loop has not reached `ACCEPT`.       | Read the Developer reports and Reviewer feedback in the timestamped archive folder.              |
| A task returns `REDIRECT`               | The reviewer decided the task direction or premise should change. | Inspect `task_round_summary.md`; its contents are passed into the next manager selection round.  |
| A new goal keeps inheriting old context | One of the memory directories still contains old task state.      | Update `--goal-path`; if needed, edit or delete stale memory files before rerunning the wrapper. |
| The archive option looks misspelled     | The current CLI option name is `--achive-dir`.                    | Use the current option name until the CLI changes.                                               |
