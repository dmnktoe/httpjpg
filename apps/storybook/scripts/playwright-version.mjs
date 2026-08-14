#!/usr/bin/env node
// Prints the pinned @playwright/test version from pnpm-lock.yaml.
// Visual baselines are renderer-specific: a bump re-renders text, so the
// cache key and artifact name have to follow the version.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function readPlaywrightVersion(lockfile) {
  const match = lockfile.match(/^ {2}'@playwright\/test@([^':]+)'/m);
  if (!match) {
    throw new Error("pnpm-lock.yaml does not pin @playwright/test");
  }
  return match[1];
}

function isMain() {
  const invoked = process.argv[1];
  return Boolean(invoked) && path.resolve(invoked) === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const lockfilePath = process.argv[2] ?? "pnpm-lock.yaml";
  process.stdout.write(`${readPlaywrightVersion(readFileSync(lockfilePath, "utf8"))}\n`);
}
