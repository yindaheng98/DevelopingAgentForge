#!/usr/bin/env bash
set -euo pipefail

npm run developing -- \
  --config "developing-forge.yaml" \
  --config "secret.yaml" \
  --target-path "output/codebase" \
  --achive-dir "output/developing-archives" \
  --artifact-path "output/developing" \
  --coding-style-skill-path "skills/coding-style" \
  --goal-path "output/goal.md" \
  --max-iterations "100" \
  --max-revision-iterations "10"
