#!/usr/bin/env node
// Runs in place of `changeset publish` for this repo's simple-mode release flow.
// - Reads the root package.json version.
// - If a matching `vX.Y.Z` tag already exists, exits cleanly (idempotent).
// - Otherwise: extracts the version's section from CHANGELOG.md, creates the
//   git tag, pushes it, and opens one GitHub Release with those notes.
//
// Expected env in CI: GITHUB_TOKEN (for the `gh` CLI).

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = rootPkg.version;
const tag = `v${version}`;

function tagExistsLocally() {
  return (
    spawnSync("git", ["rev-parse", "--verify", "--quiet", tag], {
      cwd: root,
    }).status === 0
  );
}

function tagExistsRemotely() {
  const out = spawnSync("git", ["ls-remote", "--tags", "origin", `refs/tags/${tag}`], {
    cwd: root,
    encoding: "utf8",
  });
  return out.status === 0 && out.stdout.trim().length > 0;
}

function extractReleaseNotes() {
  const ch = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
  const escaped = version.replace(/\./g, "\\.");
  const headerRe = new RegExp(`^## \\[${escaped}\\][^\\n]*$`, "m");
  const start = ch.match(headerRe);
  if (!start) {
    throw new Error(`No CHANGELOG.md section for ${version}`);
  }
  const after = ch.slice(start.index + start[0].length);
  const next = after.match(/^## \[/m);
  const body = next ? after.slice(0, next.index) : after;
  // Strip the trailing tag-link line — it duplicates the release URL.
  return body.replace(new RegExp(`^\\[${escaped}\\]:.*$`, "m"), "").trim();
}

if (tagExistsLocally() || tagExistsRemotely()) {
  console.log(`Tag ${tag} already exists. Nothing to publish.`);
  process.exit(0);
}

const notes = extractReleaseNotes();

execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: "inherit", cwd: root });
execSync(`git push origin ${tag}`, { stdio: "inherit", cwd: root });

const notesFile = path.join(os.tmpdir(), `release-notes-${version}.md`);
fs.writeFileSync(notesFile, notes);

execSync(
  `gh release create ${tag} --title ${JSON.stringify(tag)} --notes-file ${JSON.stringify(notesFile)}`,
  { stdio: "inherit", cwd: root },
);

console.log(`Published GitHub release ${tag}`);
