#!/usr/bin/env bash
set -euo pipefail

npm run developing -- \
  --config "agent-forge.yaml" \
  --target-path "output/codebase" \
  --artifact-dir "output/developing" \
  --artifact-archive-dir "output/developing-archives" \
  --paper-blueprint-path "output/paper_blueprint.md" \
  --experiment-plan-path "output/experiment_plan.md" \
  --coding-plan-path "output/coding_plan.md" \
  --max-iterations "10"
