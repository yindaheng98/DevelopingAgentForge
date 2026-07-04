# developing-agent-forge

Goal-driven code development pipelines for coding agents, built on `coding-agent-forge`.

[`src`](src) implements a goal-driven code-writing loop.

[中文说明](README.zh-CN.md)

## What This Pipeline Does

The usual entry point is [`develop.sh`](develop.sh), which calls `npm run developing` with paths for:

- the goal file or files passed with `--goal-path`
- the project progress memory directory passed with `--project-progress-memory-path`
- the code design memory directory passed with `--code-design-memory-path`
- the target codebase directory
- the development archive directory, passed through the current CLI option name `--achive-dir`

The pipeline works in the configured `--target-path`, reads the current high-level objective from one or more `--goal-path` files, recalls and updates project progress memory under `--project-progress-memory-path`, recalls and updates code design memory under `--code-design-memory-path`, and archives per-iteration task/review artifacts and streamed agent records under the configured archive directory.

## Package Surface

`package.json` publishes an ESM package named `developing-agent-forge` for Node.js `>=20.19`.

- CLI bin: `developing-agent-forge`, backed by [`src/cli.ts`](src/cli.ts), with the `developing` pipeline.
- Public imports: `developing-agent-forge`, `developing-agent-forge/agents`, and `developing-agent-forge/pipeline`.
- Runtime dependencies: `coding-agent-forge` for agent/pipeline CLI execution and `memory-agent-forge` for durable memory.
- Published assets include `dist`, `developing-forge.yaml`, both READMEs, and `LICENSE`.

TypeScript API import examples:

```ts
import { developingPipeline } from "developing-agent-forge";
import { CodingManagerAgent } from "developing-agent-forge/agents";
import { ProjectDevLoop } from "developing-agent-forge/pipeline";
```

## Core Idea

`src` turns the current goal into a repeatable code-writing trajectory. `coding-manager` reads the current repository, the goal, and remembered context, writes one bounded Task Brief or `FINISHED`, `developer` edits the target repository, and `code-reviewer` returns `ACCEPT`, `REVISE`, or `REDIRECT`.

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

This repository requires Node.js `>=20.19` and follows the npm-based TypeScript workflow defined in `package.json`.

```bash
npm ci
npm run check
npm run lint
npm run format:check
npm run build
```

Useful local script entry points:

- `npm run dev -- ...` runs `tsx src/cli.ts`.
- `npm run developing -- ...` runs `tsx src/cli.ts developing`.
- `npm run clean`, `npm run format`, and `npm run format:check` handle generated output and formatting.

## Goal File And Memory Context

`developing` accepts one or more `--goal-path <path>` values. The pipeline reads each file once at the start of the run, concatenates them in the same order they were passed, and sends the combined contents to `coding-manager`, `developer`, and `code-reviewer` as the current high-level objective.

Each time you want to execute the next new task, update the file or files passed to `--goal-path` before rerunning [`develop.sh`](develop.sh). Put any stable project contract, task context paths, constraints, or task focus directly in those goal files.

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
  --goal-path "output/goal.md" \
  --max-iterations "100" \
  --max-task-devloop-iterations "10" \
  --max-memory-rounds "3" \
  --memory-clean-interval "0"
```

The current CLI option name is `--achive-dir`.

When using the published package bin directly, replace `npm run developing --` with `developing-agent-forge developing` and keep the same pipeline options.

## Options Reference

| Option                           | Description                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `--config`                       | One or more YAML config files loaded with `coding-agent-forge`.              |
| `--target-path`                  | Target codebase directory.                                                   |
| `--achive-dir`                   | Project development archive directory.                                       |
| `--project-progress-memory-path` | Memory directory used for project progress continuity.                       |
| `--code-design-memory-path`      | Memory directory used for code design continuity.                            |
| `--goal-path`                    | Markdown file containing the current objective and task context; repeatable. |
| `--max-iterations`               | Stops the outer loop if `coding-manager` has not returned `FINISHED`.        |
| `--max-task-devloop-iterations`  | Limits developer/reviewer attempts for each selected task.                   |
| `--max-memory-rounds`            | Limits memory recall and remember refinement rounds.                         |
| `--memory-clean-interval`        | Project iterations between automatic memory clean runs; `0` disables.        |

## Main Flow

[`pipeline/pipeline.ts`](src/pipeline/pipeline.ts) parses CLI options and delegates the project development workflow to [`pipeline/project-devloop.ts`](src/pipeline/project-devloop.ts).

Each iteration does the following:

1. `coding-manager` decides what should be recalled, the pipeline recalls the matching memory, then `coding-manager` scans the current repository, the goal from `--goal-path`, and remembered context before writing one Markdown Task Brief or `FINISHED`. If its select output does not start with `FINISHED` or `# Task Brief`, the manager agent asks the same thread to correct the format.
2. `developer` edits the repository and reports what changed for review.
3. `code-reviewer` reads the Task Brief, Developer report, and recalled code-design memory, then returns `ACCEPT`, `REVISE`, or `REDIRECT`. If its output does not start with one of those decisions, the reviewer agent asks the same thread to correct the format.
4. `REVISE` sends feedback back to `developer`; `REDIRECT` returns control to `coding-manager`; `ACCEPT` finishes the task.
5. After the review loop ends, the pipeline archives the full transcript, writes `task_round_summary.md` with the Task Brief, final decision, and Developer/Reviewer report text, asks the memory update prompts what should be remembered, and stores that content through `memory-agent-forge`.
6. If `--memory-clean-interval` is positive and the completed project iteration is a multiple of it, the pipeline cleans both configured memory directories.
7. On the next project iteration, `coding-manager` receives the previous `task_round_summary.md` content as `lastTaskRoundSummary` during recall and task selection, so a `REDIRECT` can directly guide the next Task Brief.
8. The pipeline stops when `coding-manager` returns `FINISHED` or `--max-iterations` is reached.

## Output Artifacts

The pipeline maintains:

| Artifact                    | Where it lives                                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Memory files                | Under the configured project progress and code design memory directories; maintained by `memory-agent-forge`.                                                                       |
| Agent record log            | `records.jsonl` inside each timestamped archive folder; each streamed agent record is appended while the pretty record output is still printed to stdout.                           |
| Timestamped archive folders | Under the configured archive directory; contains each Task Brief, memory recall guidance, recalled memory, Developer reports, Reviewer feedback, summaries, and things to remember. |

## Important Files

| Path                                                             | Purpose                                                                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`pipeline/pipeline.ts`](src/pipeline/pipeline.ts)               | CLI argument parsing and the base `developing` pipeline wrapper.                                                         |
| [`pipeline/project-devloop.ts`](src/pipeline/project-devloop.ts) | Outer project workflow, archive creation, memory recall/update, last task summary handoff, and per-agent coordination.   |
| [`pipeline/task-devloop.ts`](src/pipeline/task-devloop.ts)       | Inner developer/reviewer loop for one selected task.                                                                     |
| [`agents/factory.ts`](src/agents/factory.ts)                     | Registers the developing coding manager, developer, and reviewer agents.                                                 |
| [`agents/types.ts`](src/agents/types.ts)                         | Shared workspace-aware base class and variables.                                                                         |
| [`agents/manager.ts`](src/agents/manager.ts)                     | Decides what to recall, selects outer-loop tasks, validates select output format, and outputs what should be remembered. |
| [`agents/developer.ts`](src/agents/developer.ts)                 | Edits the target repository.                                                                                             |
| [`agents/reviewer.ts`](src/agents/reviewer.ts)                   | Performs the read-only code review gate, validates review output format, and returns `ACCEPT`, `REVISE`, or `REDIRECT`.  |

## Troubleshooting

| Problem                                 | Likely cause                                                      | Fix                                                                                              |
| --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| The loop stops with `FINISHED`          | `coding-manager` decided no further developing task is needed.    | Inspect the memory directory and the latest archive.                                             |
| A task keeps returning `REVISE`         | The inner developer/reviewer loop has not reached `ACCEPT`.       | Read the Developer reports and Reviewer feedback in the timestamped archive folder.              |
| A task returns `REDIRECT`               | The reviewer decided the task direction or premise should change. | Inspect `task_round_summary.md`; its contents are passed into the next manager selection round.  |
| A new goal keeps inheriting old context | One of the memory directories still contains old task state.      | Update `--goal-path`; if needed, edit or delete stale memory files before rerunning the wrapper. |
| The archive option looks misspelled     | The current CLI option name is `--achive-dir`.                    | Use the current option name until the CLI changes.                                               |
