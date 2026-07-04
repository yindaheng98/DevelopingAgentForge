#!/usr/bin/env bash
set -euo pipefail

npm run developing -- \
  --config "developing-forge.yaml" \
  --config "secret.yaml" \
  --target-path "workspace/codebase" \
  --archive-root "workspace/archives" \
  --project-progress-memory-path "workspace/memory/project-progress" \
  --code-design-memory-path "workspace/memory/code-design" \
  --goal-path "workspace/plan/goal.md" \
  --max-iterations "100" \
  --max-task-devloop-iterations "10" \
  --max-memory-rounds "3"
