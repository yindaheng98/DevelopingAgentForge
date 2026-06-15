#!/usr/bin/env bash
set -euo pipefail

npm run developing-skill -- \
  --config "developing-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --artifact-path "output/developing" \
  --coding-style-skill-path "skills/coding-style" \
  --metaskill-path "metaskills/coding-style/METASKILL.md" \
  --goal-path "output/goal.md" \
  --max-iterations "100" \
  --max-revision-iterations "10"
