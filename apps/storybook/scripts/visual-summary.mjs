// Interprets Playwright's JSON report for the workflow.
//
// Default output is the markdown body of the pull request comment. With
// --verdict it prints "baselines-added", "mismatch-only" or "errors" instead,
// which is what decides how the workflow treats the failure: a label must never
// wave through a build, Docker or runner failure.

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const VERDICT_ONLY = args.includes("--verdict");
const REPORT = args.find((arg) => !arg.startsWith("--")) ?? "visual-results.json";
const MAX_LISTED = 40;

const ANSI = /\[[0-9;]*m/g;
const COMPARISON = /toHaveScreenshot/;
// Playwright fails the run that writes a snapshot for the first time, so this
// is what a story nobody has photographed yet looks like. Baselines only ever
// come from the cache `main` publishes, so a story added on a branch always
// lands here on its first run — that is new, not broken.
const FIRST_RUN = /snapshot doesn't exist/;
const PIXELS = /([\d,]+) pixels \(ratio ([\d.]+)/;

const report = JSON.parse(readFileSync(REPORT, "utf8"));

const changed = [];
const added = [];
const broken = [];
collect(report.suites ?? []);

if (VERDICT_ONLY) {
  process.stdout.write(`${verdict()}\n`);
  process.exit(0);
}

changed.sort((a, b) => b.ratio - a.ratio);

const lines = ["<!-- visual-regression -->", "### Visual regression", ""];

section(changed, ["renders differently", "render differently"], (entry) => ` — ${entry.detail}`);
section(broken, ["failed to render", "failed to render"]);
section(added, ["has no baseline yet", "have no baseline yet"]);

if (changed.length > 0 || broken.length > 0) {
  lines.push(
    "Download the `visual-report` artifact for the expected, actual and diff images.",
    "",
    "If the new rendering is correct, apply the **`visual-approved`** label and re-run the",
    "Visual Regression job. The label is dropped again on the next push.",
  );
} else {
  lines.push(
    "Nothing regressed — these stories are new, so there was nothing to compare them",
    "against. Merging publishes their first baselines from `main`.",
  );
}

process.stdout.write(`${lines.join("\n")}\n`);

function verdict() {
  // An unclassified failure is a build, Docker or runner problem and outranks
  // everything else — nothing may wave those through.
  if (broken.length > 0) {
    return "errors";
  }
  // A real difference still needs a human, even when new stories came with it.
  if (changed.length > 0) {
    return "mismatch-only";
  }
  if (added.length > 0) {
    return "baselines-added";
  }
  // No failures at all means the step died outside the tests.
  return "errors";
}

function collect(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      if (spec.ok) {
        continue;
      }
      for (const test of spec.tests ?? []) {
        const result = test.results?.at(-1);
        if (!result || result.status === "passed") {
          continue;
        }
        classify(spec.title, test.projectName, (result.error?.message ?? "").replace(ANSI, ""));
      }
    }
    collect(suite.suites ?? []);
  }
}

function classify(title, project, message) {
  // Checked before COMPARISON: depending on the Playwright version the
  // first-run message can carry a call log naming the matcher, which would
  // otherwise read as a comparison that moved zero pixels.
  if (FIRST_RUN.test(message)) {
    added.push({ title, project });
    return;
  }

  if (!COMPARISON.test(message)) {
    broken.push({ title, project });
    return;
  }

  const pixels = message.match(PIXELS);
  changed.push({
    title,
    project,
    ratio: pixels ? Number(pixels[2]) : 0,
    detail: pixels ? `${pixels[1]} px (${(Number(pixels[2]) * 100).toFixed(1)}%)` : "changed",
  });
}

function section(entries, [one, many], suffix) {
  if (entries.length === 0) {
    return;
  }

  const single = entries.length === 1;
  lines.push(`**${entries.length} ${single ? "story" : "stories"} ${single ? one : many}:**`, "");

  for (const entry of entries.slice(0, MAX_LISTED)) {
    lines.push(`- \`${entry.project}\` · ${entry.title}${suffix ? suffix(entry) : ""}`);
  }
  if (entries.length > MAX_LISTED) {
    lines.push(`- …and ${entries.length - MAX_LISTED} more`);
  }

  lines.push("");
}
