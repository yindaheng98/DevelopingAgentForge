# Developing Pipeline

[`src/developing`](.) implements the code-writing loop used after the three planning artifacts are ready. The usual entry point is [`runs/develop.sh`](../../runs/develop.sh), which calls `npm run developing` with paths for:

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

## Main Flow

[`pipeline.ts`](pipeline.ts) parses CLI options and repeats an outer coding-manager task loop with an inner developer/reviewer repair loop.

Each iteration does the following:

1. `coding-manager` scans the current repository and `TODO.md` in the artifact directory, then chooses one developer task.
2. `developer` loads the configured coding-style skill, edits the repository, and reports what changed for review.
3. `code-reviewer` reads the code and developer report, then returns exactly `ACCEPT` or revision feedback.
4. If the reviewer returns feedback, `developer` fixes the same task and `code-reviewer` reviews again.
5. After the review loop ends, the pipeline archives the task and reports, then asks `coding-manager` to update the TODO file.
6. The pipeline stops when `coding-manager` returns `FINISHED` or `--max-iterations` is reached.

## Important Files

- [`pipeline.ts`](pipeline.ts): argument parsing, loop orchestration, archive creation, and per-agent handoff.
- [`pipelineskill.ts`](pipelineskill.ts): `developing-skill` wrapper that adds trajectory optimization hooks around the base loop.
- [`agents/factory.ts`](agents/factory.ts): registers the developing coding manager, developer, and reviewer agents.
- [`agents/types.ts`](agents/types.ts): shared workspace-aware base class and variables.
- [`agents/manager.ts`](agents/manager.ts): maintains the TODO file and selects outer-loop tasks.
- [`agents/developer.ts`](agents/developer.ts): edits the target repository using the shared coding-style skill.
- [`agents/reviewer.ts`](agents/reviewer.ts): performs the read-only code review gate.
- [`agents/trajectory-optimizer.ts`](agents/trajectory-optimizer.ts): scans the trajectory and proposes coding-style skill improvements for `developing-skill`.

## Artifacts

The pipeline maintains:

- `TODO.md` under the configured artifact directory: the coding-manager-maintained task list.
- timestamped archive folders containing each selected task, per-revision reports, and TODO update reports.
