#!/usr/bin/env bash
set -euo pipefail

npm run developing-skill -- \
  --config "agent-forge.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-skill-archives" \
  --todo-path "output/developing/TODO.md" \
  --excellent-repo-skill-path "skills/academic-army-excellent-repo" \
  --metaskill-path "metaskills/academic-army-excellent-repo/METASKILL.md" \
  --paper-blueprint-path "output/paper_blueprint.md" \
  --experiment-plan-path "output/experiment_plan.md" \
  --coding-plan-path "output/coding_plan.md" \
  --max-iterations "10" \
  --max-revision-iterations "3"
