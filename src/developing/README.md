# Developing Pipeline

[`src/developing`](.) implements the code-writing loop used after the three planning artifacts are ready. The usual entry point is [`runs/develop.sh`](../../runs/develop.sh), which calls `npm run developing` with paths for:

- `paper_blueprint.md`
- `experiment_plan.md`
- `coding_plan.md`
- the target codebase directory
- development artifact and archive directories

The pipeline writes code under the configured `--target-path` and keeps state under the configured artifact directory.

For the overall TypeScript pipeline usage and entry points, see [`src/README.md`](../README.md).

## Main Flow

[`pipeline.ts`](pipeline.ts) parses CLI options, initializes shared paths, creates missing state files, and repeats the loop until `integration-manager` returns `Finished` or `--max-iterations` is reached.

Each iteration does the following:

1. `coding-plan-interpreter` reads the coding plan, current implementation state, previous review/audit/harness feedback, and selects exactly one bounded task.
2. `developer` implements only that selected task in the target codebase.
3. `harness-engineer` verifies the task with the smallest useful tests, fixtures, harness checks, or parser checks.
4. `code-reviewer` reviews code quality, maintainability, boundaries, coupling, and test/harness separation.
5. `experiment-contract-auditor` checks whether the implementation still matches the paper blueprint, experiment plan, coding plan, metrics, baseline fairness rules, raw-result requirements, and method-freeze protocol.
6. `integration-manager` updates `implementation_state.md`, `code_overview.md`, and `next_developer_task.md`, then either returns `Finished` or hands off the next repair/task.

## Important Files

- [`pipeline.ts`](pipeline.ts): argument parsing, loop orchestration, archive creation, and per-agent handoff.
- [`agents/factory.ts`](agents/factory.ts): registers the six developing agents.
- [`agents/types.ts`](agents/types.ts): shared workspace-aware base class and variables.
- [`agents/prompts.ts`](agents/prompts.ts): shared developing contract and report format.
- [`agents/interpreter.ts`](agents/interpreter.ts): turns the coding plan and current state into one bounded task.
- [`agents/developer.ts`](agents/developer.ts): performs implementation for the selected task.
- [`agents/harness.ts`](agents/harness.ts): verifies behavior and experiment harness outputs.
- [`agents/reviewer.ts`](agents/reviewer.ts): performs read-only code review.
- [`agents/auditor.ts`](agents/auditor.ts): performs read-only experiment-contract audit.
- [`agents/manager.ts`](agents/manager.ts): owns loop state, overview, next-task handoff, and final completion decision.

## Artifacts

The pipeline maintains:

- `code_overview.md`: evolving description of the generated codebase.
- `implementation_state.md`: task IDs, status, files, evidence, and verification state.
- `next_developer_task.md`: repair or next-task handoff when the loop is not finished.
- timestamped archive folders containing each iteration's task, reports, audit, review, and release decision.
