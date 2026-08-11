// Turns Playwright's JSON report into the body of the pull request comment.
// Prints markdown to stdout; posting it is the workflow's job.

import { readFileSync } from "node:fs";

const REPORT = process.argv[2] ?? "visual-results.json";
const MAX_LISTED = 40;

const ANSI = /\[[0-9;]*m/g;
const COMPARISON = /toHaveScreenshot/;
const PIXELS = /([\d,]+) pixels \(ratio ([\d.]+)/;

const report = JSON.parse(readFileSync(REPORT, "utf8"));

const changed = [];
const broken = [];
collect(report.suites ?? []);

changed.sort((a, b) => b.ratio - a.ratio);

const lines = ["<!-- visual-regression -->", "### Visual regression", ""];

section(changed, ["renders differently", "render differently"], (entry) => ` — ${entry.detail}`);
section(broken, ["failed to render", "failed to render"]);

lines.push(
  "Download the `visual-report` artifact for the expected, actual and diff images.",
  "",
  "If the new rendering is correct, apply the **`visual-approved`** label and re-run the",
  "Visual Regression job. The label is dropped again on the next push.",
);

console.log(lines.join("\n"));

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
