# Developing Pipeline

[`src/developing`](.) implements the code-writing loop used after the three planning artifacts are ready.

[中文说明](README.zh-CN.md)

## What This Pipeline Does

The usual entry point is [`runs/develop.sh`](../../runs/develop.sh), which calls `npm run developing` with paths for:

- `paper_blueprint.md`
- `experiment_plan.md`
- `coding_plan.md`
- `skills/academic-army-coding-style/SKILL.md`
- the artifact directory containing `TODO.md`
- the target codebase directory
- the development archive directory, passed through the current CLI option name `--achive-dir`

The pipeline works in the configured `--target-path`, maintains `TODO.md` under the configured `--artifact-path`, and archives per-iteration task/review artifacts under the configured archive directory.

[`runs/develop-skill.sh`](../../runs/develop-skill.sh) calls the related `developing-skill` pipeline in [`pipelineskill.ts`](pipelineskill.ts). It runs the same development loop, adds `--metaskill-path`, and invokes `trajectory-optimizer` before the revision loop and after TODO updates so the coding-style skill can be improved from concrete development feedback.

For the overall TypeScript pipeline usage and entry points, see [`src/README.md`](../README.md).

## Quick Start

From the repository root, run the prepared wrapper:

```bash
bash runs/develop.sh
```

Use the wrapper with the conventional project paths listed above to write code under `output/codebase`.

## Direct Command

`runs/develop.sh` calls:

```bash
npm run developing -- \
  --config "agent-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --artifact-path "output/developing" \
  --coding-style-skill-path "skills/academic-army-coding-style" \
  --paper-blueprint-path "output/paper_blueprint.md" \
  --experiment-plan-path "output/experiment_plan.md" \
  --coding-plan-path "output/coding_plan.md" \
  --max-iterations "100" \
  --max-revision-iterations "10"
```

The current CLI option name is `--achive-dir`.

## Options Reference

| Option | Description |
|---|---|
| `--config` | One or more YAML config files loaded with `coding-agent-forge`. |
| `--target-path` | Target codebase directory. |
| `--achive-dir` | Development archive directory. |
| `--artifact-path` | Artifact directory containing `TODO.md`. |
| `--coding-style-skill-path` | Configured coding-style skill. |
| `--paper-blueprint-path` | `paper_blueprint.md`. |
| `--experiment-plan-path` | `experiment_plan.md`. |
| `--coding-plan-path` | `coding_plan.md`. |
| `--max-iterations` | Stops the outer loop if `coding-manager` has not returned `FINISHED`. |
| `--max-revision-iterations` | Limits the inner developer/reviewer repair loop. |

## Main Flow

[`pipeline.ts`](pipeline.ts) parses CLI options and repeats an outer coding-manager task loop with an inner developer/reviewer repair loop.

Each iteration does the following:

1. `coding-manager` scans the current repository and `TODO.md` in the artifact directory, then chooses one developer task.
2. `developer` loads the configured coding-style skill, edits the repository, and reports what changed for review.
3. `code-reviewer` reads the code and developer report, then returns exactly `ACCEPT` or revision feedback.
4. If the reviewer returns feedback, `developer` fixes the same task and `code-reviewer` reviews again.
5. After the review loop ends, the pipeline archives the task and reports, then asks `coding-manager` to update the TODO file.
6. The pipeline stops when `coding-manager` returns `FINISHED` or `--max-iterations` is reached.

## Output Artifacts

The pipeline maintains:

| Artifact | Where it lives |
|---|---|
| `TODO.md` | Under the configured artifact directory; the coding-manager-maintained task list. |
| Timestamped archive folders | Under the configured archive directory; contains each selected task, per-revision reports, and TODO update reports. |

## Important Files

| Path | Purpose |
|---|---|
| [`pipeline.ts`](pipeline.ts) | Argument parsing, loop orchestration, archive creation, and per-agent handoff. |
| [`pipelineskill.ts`](pipelineskill.ts) | `developing-skill` wrapper that adds trajectory optimization hooks around the base loop. |
| [`agents/factory.ts`](agents/factory.ts) | Registers the developing coding manager, developer, and reviewer agents. |
| [`agents/types.ts`](agents/types.ts) | Shared workspace-aware base class and variables. |
| [`agents/manager.ts`](agents/manager.ts) | Maintains the TODO file and selects outer-loop tasks. |
| [`agents/developer.ts`](agents/developer.ts) | Edits the target repository using the shared coding-style skill. |
| [`agents/reviewer.ts`](agents/reviewer.ts) | Performs the read-only code review gate. |
| [`agents/trajectory-optimizer.ts`](agents/trajectory-optimizer.ts) | Scans the trajectory and proposes coding-style skill improvements for `developing-skill`. |

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| The loop stops with `FINISHED` | `coding-manager` decided no further developer task is needed. | Inspect `TODO.md` in the artifact directory and the latest archive. |
| A task keeps returning revision feedback | The inner developer/reviewer repair loop has not reached `ACCEPT`. | Read the per-revision reports in the timestamped archive folder. |
| The archive option looks misspelled | The current CLI option name is `--achive-dir`. | Use the current option name until the CLI changes. |
