#!/usr/bin/env bash
#
# Syncs a diffs directory (and optionally the Playwright HTML report) to an
# S3-compatible bucket. Coolify's Garage (or SeaweedFS) one-click service is
# the intended backend — any S3 API works. The pull request comment then
# embeds the objects via VISUAL_S3_PUBLIC_URL.
#
# Usage: upload-visual-report.sh <diffs-dir> [playwright-report-dir]
# Requires: VISUAL_S3_ENDPOINT, VISUAL_S3_BUCKET, VISUAL_S3_ACCESS_KEY,
#           VISUAL_S3_SECRET_KEY, VISUAL_S3_PUBLIC_URL, PR, SHA

set -euo pipefail

DIFFS="${1:?diffs directory}"
REPORT="${2:-}"

for var in VISUAL_S3_ENDPOINT VISUAL_S3_BUCKET VISUAL_S3_ACCESS_KEY VISUAL_S3_SECRET_KEY VISUAL_S3_PUBLIC_URL PR SHA; do
  if [[ -z "${!var:-}" ]]; then
    echo "$var is required." >&2
    exit 1
  fi
done

export AWS_ACCESS_KEY_ID="$VISUAL_S3_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$VISUAL_S3_SECRET_KEY"
export AWS_DEFAULT_REGION="${VISUAL_S3_REGION:-garage}"
export AWS_EC2_METADATA_DISABLED=true

ENDPOINT="${VISUAL_S3_ENDPOINT%/}"
BUCKET="$VISUAL_S3_BUCKET"
PREFIX="pr/${PR}/${SHA}"
PUBLIC="${VISUAL_S3_PUBLIC_URL%/}/${PREFIX}"

sync_tree() {
  local root="$1"
  local key="$2"
  if [[ ! -d "$root" ]]; then
    return 0
  fi
  aws s3 sync "$root" "s3://${BUCKET}/${PREFIX}/${key}" \
    --endpoint-url "$ENDPOINT" \
    --only-show-errors
}

sync_tree "$DIFFS" "diffs"
if [[ -n "$REPORT" ]]; then
  sync_tree "$REPORT" "report"
fi

echo "uploaded ${PUBLIC}"
