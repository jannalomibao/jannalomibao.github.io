#!/usr/bin/env bash
# Deploys the portfolio to GitHub Pages.
#
# Actual deployment happens in the GitHub Actions workflow
# (.github/workflows/deploy.yml) on every push to `main`. This script is the
# one-command trigger: it builds locally first so a broken build fails fast
# on your machine instead of burning a CI run, then commits and pushes.
#
# Prerequisites (one-time, see devops/README.md):
#   1. Create the jannalomibao.github.io repo on GitHub.
#   2. Run `terraform apply` in devops/terraform to enable Pages
#      (source = GitHub Actions) — must happen before the first push, or
#      the deploy job's actions/deploy-pages step has nothing to deploy to.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_URL="${REPO_URL:-https://github.com/jannalomibao/jannalomibao.github.io.git}"
BRANCH="${BRANCH:-main}"

cd "$ROOT_DIR"

echo "==> Building frontend to verify it compiles before pushing"
(cd frontend && npm ci && npm run build)

if [ ! -d .git ]; then
  echo "==> No git repo here yet — initializing"
  git init -b "$BRANCH"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "==> Adding remote origin: $REPO_URL"
  git remote add origin "$REPO_URL"
fi

echo "==> Staging changes"
git add -A

if git diff --cached --quiet; then
  echo "==> No changes to commit."
else
  git commit -m "Deploy: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
fi

echo "==> Pushing to origin/$BRANCH — this triggers the GitHub Actions deploy workflow"
git push -u origin "$BRANCH"

echo
echo "==> Push complete. GitHub Actions is building and deploying now."
echo "    Workflow runs: https://github.com/jannalomibao/jannalomibao.github.io/actions"
echo "    Site (live once the workflow finishes): https://jannalomibao.github.io/"

if command -v gh >/dev/null 2>&1; then
  echo
  echo "==> Watching the workflow run (Ctrl+C to stop watching; the deploy keeps going)"
  sleep 5
  gh run watch --repo jannalomibao/jannalomibao.github.io || true
fi
