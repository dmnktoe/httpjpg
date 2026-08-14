#!/usr/bin/env node
// Interprets Playwright's JSON report for the workflow.
//
// Default output is the markdown body of the pull request comment. With
// --verdict it prints "baselines-added", "mismatch-only" or "errors" instead,
// which is what decides how the workflow treats the failure: a label must never
// wave through a build, Docker or runner failure.
//
// --copy-diffs <dir> copies expected/actual/diff attachments for the worst
// mismatches so the workflow can publish them and embed them in the comment.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
const COMPARISON = /toHaveScreenshot/;
const FIRST_RUN = /snapshot doesn't exist/;
const PIXELS = /([\d,]+) pixels \(ratio ([\d.]+)/;
const MAX_LISTED = 40;
const MAX_EMBEDDED_DIFFS = 8;
const DOCKER_ROOT = "/work/";

export function collectFromReport(report) {
  const changed = [];
  const added = [];
  const broken = [];
  collect(report.suites ?? [], changed, added, broken);
  changed.sort((a, b) => b.ratio - a.ratio);
  return { changed, added, broken };
}

export function verdict({ changed, added, broken }) {
  if (broken.length > 0) {
    return "errors";
  }
  if (changed.length > 0) {
    return "mismatch-only";
  }
  if (added.length > 0) {
    return "baselines-added";
  }
  return "errors";
}

export function slugFor(project, title) {
  return `${project} ${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function resolveAttachmentPath(filePath, roots = defaultRoots()) {
  if (!filePath) {
    return null;
  }

  const candidates = [filePath, path.resolve(roots.storybookRoot, filePath)];
  if (filePath.startsWith(DOCKER_ROOT)) {
    candidates.push(path.join(roots.repoRoot, filePath.slice(DOCKER_ROOT.length)));
  }

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

export function copyDiffs(parsed, outputDir, roots = defaultRoots()) {
  mkdirSync(outputDir, { recursive: true });
  const copied = [];

  for (const entry of parsed.changed.slice(0, MAX_EMBEDDED_DIFFS)) {
    const slug = slugFor(entry.project, entry.title);
    const files = {};
    const attachments = entry.attachments ?? [];

    for (const kind of ["expected", "actual", "diff"]) {
      const attachment = attachments.find((item) => item.name === kind);
      const source = resolveAttachmentPath(attachment?.path, roots);
      if (!source) {
        continue;
      }
      const filename = `${slug}-${kind}.png`;
      copyFileSync(source, path.join(outputDir, filename));
      files[kind] = filename;
    }

    if (files.diff || files.actual) {
      copied.push({ title: entry.title, project: entry.project, slug, files });
    }
  }

  return copied;
}

export function formatComment(parsed, options = {}) {
  const { changed, added, broken } = parsed;
  const diffsBaseUrl = options.diffsBaseUrl?.replace(/\/$/, "");
  const copied = options.copied ?? [];
  const copiedByKey = new Map(copied.map((item) => [`${item.project}\0${item.title}`, item]));
  const runUrl = options.runUrl;
  const reportUrl = options.reportUrl;

  const lines = ["<!-- visual-regression -->", "### Visual regression", ""];

  section(lines, changed, ["renders differently", "render differently"], (entry) => {
    const bits = [` — ${entry.detail}`];
    const images = copiedByKey.get(`${entry.project}\0${entry.title}`);
    if (diffsBaseUrl && images) {
      bits.push("", imageTable(diffsBaseUrl, images.files));
    }
    return bits.join("\n");
  });
  section(lines, broken, ["failed to render", "failed to render"]);
  section(lines, added, ["has no baseline yet", "have no baseline yet"]);

  if (changed.length > 0 || broken.length > 0) {
    if (reportUrl) {
      lines.push(
        `Open the [screenshot report](${reportUrl}) to step through expected / actual / diff.`,
        "",
      );
    } else if (runUrl) {
      lines.push(
        `The [workflow run](${runUrl}) has the \`visual-report\` artifact with every expected, actual and diff image.`,
        "",
      );
    } else {
      lines.push(
        "Download the `visual-report` artifact for the expected, actual and diff images.",
        "",
      );
    }
    lines.push(
      "If the new rendering is correct, click **Approve diffs** on the `Visual diffs` check —",
      "CI applies `visual-approved` and re-runs the failed jobs. The approval is dropped on",
      "the next push. Applying the label by hand does the same thing.",
    );
  } else {
    lines.push(
      "Nothing regressed — these stories are new, so there was nothing to compare them",
      "against. Merging publishes their first baselines from `main`.",
    );
  }

  return `${lines.join("\n")}\n`;
}

function section(lines, entries, [one, many], suffix) {
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

function imageTable(baseUrl, files) {
  const cells = [];
  const headers = [];
  for (const kind of ["expected", "actual", "diff"]) {
    if (!files[kind]) {
      continue;
    }
    headers.push(kind);
    cells.push(`<img src="${baseUrl}/${files[kind]}" alt="${kind}" width="240" />`);
  }
  if (cells.length === 0) {
    return "";
  }
  return [
    "",
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => ":---:").join(" | ")} |`,
    `| ${cells.join(" | ")} |`,
  ].join("\n");
}

function collect(suites, changed, added, broken) {
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
        classify(
          spec.title,
          test.projectName,
          (result.error?.message ?? "").replace(ANSI, ""),
          result.attachments ?? [],
          changed,
          added,
          broken,
        );
      }
    }
    collect(suite.suites ?? [], changed, added, broken);
  }
}

function classify(title, project, message, attachments, changed, added, broken) {
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
    attachments,
  });
}

function defaultRoots() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const storybookRoot = path.resolve(scriptDir, "..");
  return { repoRoot: path.resolve(storybookRoot, "../.."), storybookRoot };
}

function parseArgs(argv) {
  const options = {
    verdictOnly: false,
    copyDiffsDir: undefined,
    diffsBaseUrl: process.env.DIFFS_BASE_URL,
    runUrl: process.env.RUN_URL,
    reportUrl: process.env.REPORT_URL,
    reportPath: "visual-results.json",
  };
  const takesValue = new Set(["--copy-diffs", "--diffs-base-url", "--run-url", "--report-url"]);

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--verdict") {
      options.verdictOnly = true;
      continue;
    }
    if (takesValue.has(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} expects a value`);
      }
      if (arg === "--copy-diffs") {
        options.copyDiffsDir = value;
      } else if (arg === "--diffs-base-url") {
        options.diffsBaseUrl = value;
      } else if (arg === "--run-url") {
        options.runUrl = value;
      } else {
        options.reportUrl = value;
      }
      index += 1;
      continue;
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown flag ${arg}`);
    }
    options.reportPath = arg;
  }

  return options;
}

function isMain() {
  const invoked = process.argv[1];
  return Boolean(invoked) && path.resolve(invoked) === fileURLToPath(import.meta.url);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const parsed = collectFromReport(JSON.parse(readFileSync(args.reportPath, "utf8")));

  if (args.verdictOnly) {
    process.stdout.write(`${verdict(parsed)}\n`);
    return;
  }

  const copied = args.copyDiffsDir ? copyDiffs(parsed, args.copyDiffsDir) : [];
  process.stdout.write(
    formatComment(parsed, {
      diffsBaseUrl: args.diffsBaseUrl,
      copied,
      runUrl: args.runUrl,
      reportUrl: args.reportUrl,
    }),
  );
}

if (isMain()) {
  main();
}
