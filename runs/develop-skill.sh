#!/usr/bin/env bash
set -euo pipefail

npm run developing-skill -- \
  --config "agent-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --artifact-path "output/developing" \
  --coding-style-skill-path "skills/academic-army-coding-style" \
  --metaskill-path "metaskills/academic-army-coding-style/METASKILL.md" \
  --paper-blueprint-path "output/paper_blueprint.md" \
  --experiment-plan-path "output/experiment_plan.md" \
  --coding-plan-path "output/coding_plan.md" \
  --max-iterations "100" \
  --max-revision-iterations "10"
