#!/usr/bin/env node
// Replaces `changeset version` for this repo's simple-mode release flow.
//
// Why custom: Changesets' `fixed` mode + workspace-dep cascade across 16
// internal packages promotes minor bumps to major. We bypass that and drive
// the lockstep bump ourselves. All workspace deps use `workspace:*`, so pnpm
// resolves to the current version at install/publish — no need to rewrite
// internal dependency ranges.
//
// What it does:
//   1. Reads .changeset/*.md, groups summaries by Conventional Commit type,
//      and computes the highest bump level (patch < minor < major).
//   2. Bumps the root package.json AND every workspace package's version in
//      lockstep.
//   3. Prepends one aggregated section to the root CHANGELOG.md.
//   4. Deletes the consumed .changeset/*.md files.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const csDir = path.join(root, ".changeset");
const rootPkgPath = path.join(root, "package.json");
const changelogPath = path.join(root, "CHANGELOG.md");

const BUMP_RANK = { patch: 0, minor: 1, major: 2 };
const SECTION_HEADERS = {
  feat: "### Features",
  fix: "### Bug Fixes",
  perf: "### Performance",
  refactor: "### Refactors",
  docs: "### Documentation",
  build: "### Build System",
  ci: "### Continuous Integration",
  other: "### Other Changes",
};
const TYPE_ORDER = ["feat", "fix", "perf", "refactor", "docs", "build", "ci", "other"];

function readChangesets() {
  const files = fs.readdirSync(csDir).filter((f) => f.endsWith(".md") && f !== "README.md");

  const grouped = Object.fromEntries(TYPE_ORDER.map((k) => [k, []]));
  let bump = "patch";

  for (const f of files) {
    const content = fs.readFileSync(path.join(csDir, f), "utf8");
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) continue;
    const frontmatter = match[1];
    const summary = match[2].trim();

    for (const line of frontmatter.split("\n")) {
      const m = line.match(/^["']?[^"':]+["']?\s*:\s*(patch|minor|major)\s*$/);
      if (m && BUMP_RANK[m[1]] > BUMP_RANK[bump]) bump = m[1];
    }

    if (!summary) continue;
    const typed = summary.match(
      /^(feat|fix|perf|refactor|docs|build|ci)(?:\([^)]+\))?:\s*([\s\S]+)$/,
    );
    if (typed) {
      grouped[typed[1]].push(typed[2].trim());
    } else {
      grouped.other.push(summary);
    }
  }

  return { files, grouped, bump };
}

function nextVersion(current, bump) {
  const [maj, min, pat] = current.split(".").map(Number);
  if (bump === "major") return `${maj + 1}.0.0`;
  if (bump === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

function writeJsonPreservingNewline(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function bumpAllPackages(version) {
  const targets = [rootPkgPath];
  for (const ws of ["apps", "packages"]) {
    const dir = path.join(root, ws);
    if (!fs.existsSync(dir)) continue;
    for (const sub of fs.readdirSync(dir)) {
      const p = path.join(dir, sub, "package.json");
      if (fs.existsSync(p)) targets.push(p);
    }
  }
  for (const file of targets) {
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    pkg.version = version;
    writeJsonPreservingNewline(file, pkg);
  }
}

function buildSection(version, grouped) {
  const today = new Date().toISOString().slice(0, 10);
  let out = `## [${version}] - ${today}\n\n`;
  for (const type of TYPE_ORDER) {
    const entries = grouped[type];
    if (entries.length === 0) continue;
    out += `${SECTION_HEADERS[type]}\n\n`;
    for (const e of entries) {
      out += `- ${e.replace(/\r?\n+/g, " ").trim()}\n`;
    }
    out += "\n";
  }
  out += `[${version}]: https://github.com/dmnktoe/httpjpg/releases/tag/v${version}\n\n`;
  return out;
}

function prependChangelog(section) {
  const existing = fs.existsSync(changelogPath)
    ? fs.readFileSync(changelogPath, "utf8")
    : "# Changelog\n\n";

  const firstEntry = existing.search(/^## \[/m);
  if (firstEntry === -1) {
    fs.writeFileSync(changelogPath, `${existing.trimEnd()}\n\n${section}`);
  } else {
    fs.writeFileSync(
      changelogPath,
      existing.slice(0, firstEntry) + section + existing.slice(firstEntry),
    );
  }
}

function deleteConsumedChangesets(files) {
  for (const f of files) fs.unlinkSync(path.join(csDir, f));
}

const { files, grouped, bump } = readChangesets();
if (files.length === 0) {
  console.log("No changesets pending. Nothing to do.");
  process.exit(0);
}

const current = JSON.parse(fs.readFileSync(rootPkgPath, "utf8")).version;
const version = nextVersion(current, bump);

bumpAllPackages(version);
prependChangelog(buildSection(version, grouped));
deleteConsumedChangesets(files);

console.log(`Versioned ${current} → ${version} (${bump})`);
