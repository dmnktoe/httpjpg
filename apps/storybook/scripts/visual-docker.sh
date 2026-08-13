#!/usr/bin/env bash
#
# Runs the visual suite in the Playwright image matching the installed
# @playwright/test. CI calls this too, so a set taken here and the set main
# publishes are the same bytes.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
APP="$ROOT/apps/storybook"

if [ ! -f "$APP/storybook-static/index.json" ]; then
  echo "storybook-static/index.json is missing." >&2
  echo "Build it first: pnpm --filter @httpjpg/storybook build" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required — it pins the renderer that produced the baselines." >&2
  echo "Without it: pnpm --filter @httpjpg/storybook test:visual:smoke" >&2
  exit 1
fi

VERSION="$(node -p "require('$APP/node_modules/@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${VERSION}-noble"

DOCKER_FLAGS=(--rm --ipc=host --user "$(id -u):$(id -g)" -e HOME=/tmp -e CI)
if [ -t 1 ]; then
  DOCKER_FLAGS+=(-it)
fi

exec docker run \
  "${DOCKER_FLAGS[@]}" \
  -v "$ROOT:/work" \
  -w /work/apps/storybook \
  "$IMAGE" \
  ./node_modules/.bin/playwright test "$@"
