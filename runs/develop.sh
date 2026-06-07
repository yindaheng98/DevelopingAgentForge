#!/usr/bin/env bash
set -euo pipefail

npm run developing -- \
  --config "agent-forge.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --todo-path "output/developing/TODO.md" \
  --excellent-repo-skill-path "skills/academic-army-excellent-repo" \
  --paper-blueprint-path "output/paper_blueprint.md" \
  --experiment-plan-path "output/experiment_plan.md" \
  --coding-plan-path "output/coding_plan.md" \
  --max-iterations "10" \
  --max-revision-iterations "3"
