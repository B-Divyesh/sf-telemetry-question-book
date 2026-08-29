#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo_root"

slug=telemetry-question-book
static_app=sf-telemetry-question-book
resource_group=sociobot
deploy_static_script=${DEPLOY_STATIC_SCRIPT:-/opt/fleet/lib/deploy-static.sh}
build_id=$(git rev-parse HEAD)

if [[ ! "$build_id" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Deployment needs a full Git commit ID." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain --untracked-files=all)" ]]; then
  echo "Commit all changes before deployment so BUILD_ID identifies the artifact." >&2
  exit 1
fi

npm run build

# Set identity before upload because managed Functions read settings while the
# new API artifact is activated.
# Azure retains SnapshotStorage and every unrelated setting when this one key is set.
az staticwebapp appsettings set \
  --name "$static_app" \
  --resource-group "$resource_group" \
  --setting-names "BUILD_ID=$build_id" \
  --output none

"$deploy_static_script" "$slug" dist

npm run verify:live-api -- "$build_id"
