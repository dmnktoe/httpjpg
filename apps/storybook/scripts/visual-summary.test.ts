// @vitest-environment node

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readPlaywrightVersion } from "./playwright-version.mjs";
import {
  collectFromReport,
  copyDiffs,
  formatComment,
  resolveAttachmentPath,
  slugFor,
  verdict,
} from "./visual-summary.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

describe("readPlaywrightVersion", () => {
  it("reads the pinned version from a pnpm lockfile packages entry", () => {
    expect(
      readPlaywrightVersion(`
  '@pkg/other@1.0.0':
    resolution: {integrity: sha512-abc}

  '@playwright/test@1.62.1':
    resolution: {integrity: sha512-abc}
    engines: {node: '>=20'}
`),
    ).toBe("1.62.1");
  });

  it("throws when the lockfile does not pin playwright", () => {
    expect(() => readPlaywrightVersion("packages: {}\n")).toThrow(/does not pin @playwright\/test/);
  });
});

describe("slugFor", () => {
  it("builds a stable filename slug", () => {
    expect(slugFor("desktop", "WorkCard › Default")).toBe("desktop-workcard-default");
  });
});

describe("collectFromReport / verdict", () => {
  it("classifies a screenshot mismatch", () => {
    const parsed = collectFromReport(
      report([
        spec("WorkCard › Default", "desktop", {
          status: "failed",
          error: {
            message:
              "Error: expect(page).toHaveScreenshot(...) failed\n\n  1,234 pixels (ratio 0.0123) are different",
          },
        }),
      ]),
    );

    expect(verdict(parsed)).toBe("mismatch-only");
    expect(parsed.changed).toEqual([
      expect.objectContaining({
        title: "WorkCard › Default",
        project: "desktop",
        ratio: 0.0123,
        detail: "1,234 px (1.2%)",
      }),
    ]);
  });

  it("classifies a first-run snapshot as added", () => {
    const parsed = collectFromReport(
      report([
        spec("Button › Primary", "desktop", {
          status: "failed",
          error: { message: "A snapshot doesn't exist at foo.png, writing actual" },
        }),
      ]),
    );

    expect(verdict(parsed)).toBe("baselines-added");
    expect(parsed.added).toEqual([{ title: "Button › Primary", project: "desktop" }]);
  });

  it("classifies a render crash as errors, even next to a mismatch", () => {
    const parsed = collectFromReport(
      report([
        spec("WorkCard › Default", "desktop", {
          status: "failed",
          error: {
            message:
              "Error: expect(page).toHaveScreenshot(...) failed\n  12 pixels (ratio 0.001) are different",
          },
        }),
        spec("Header › Mobile", "mobile", {
          status: "failed",
          error: { message: "Error: page.goto: net::ERR_CONNECTION_REFUSED" },
        }),
      ]),
    );

    expect(verdict(parsed)).toBe("errors");
    expect(parsed.broken).toEqual([{ title: "Header › Mobile", project: "mobile" }]);
  });

  it("ranks a report with no failed specs as errors", () => {
    expect(verdict(collectFromReport({ suites: [] }))).toBe("errors");
  });

  it("sorts mismatches by ratio descending", () => {
    const parsed = collectFromReport(
      report([
        spec("Small", "desktop", {
          status: "failed",
          error: { message: "toHaveScreenshot 10 pixels (ratio 0.001) are different" },
        }),
        spec("Large", "desktop", {
          status: "failed",
          error: { message: "toHaveScreenshot 99 pixels (ratio 0.2) are different" },
        }),
      ]),
    );

    expect(parsed.changed.map((entry) => entry.title)).toEqual(["Large", "Small"]);
  });
});

describe("formatComment", () => {
  it("lists mismatches and points at the artifact", () => {
    const body = formatComment({
      changed: [
        {
          title: "WorkCard › Default",
          project: "desktop",
          ratio: 0.01,
          detail: "12 px (1.0%)",
          attachments: [],
        },
      ],
      added: [],
      broken: [],
    });

    expect(body).toMatch(/^<!-- visual-regression -->\n/);
    expect(body).toContain("**1 story renders differently:**");
    expect(body).toContain("`desktop` · WorkCard › Default — 12 px (1.0%)");
    expect(body).toContain("visual-report");
    expect(body).toContain("Approve diffs");
    expect(body).toContain("visual-approved");
  });

  it("embeds a diff table when images were published", () => {
    const body = formatComment(
      {
        changed: [
          {
            title: "WorkCard › Default",
            project: "desktop",
            ratio: 0.01,
            detail: "12 px (1.0%)",
            attachments: [],
          },
        ],
        added: [],
        broken: [],
      },
      {
        diffsBaseUrl: "https://raw.githubusercontent.com/acme/repo/visual/pr-1",
        copied: [
          {
            title: "WorkCard › Default",
            project: "desktop",
            slug: "desktop-workcard-default",
            files: {
              expected: "desktop-workcard-default-expected.png",
              actual: "desktop-workcard-default-actual.png",
              diff: "desktop-workcard-default-diff.png",
            },
          },
        ],
        runUrl: "https://github.com/acme/repo/actions/runs/9",
        reportUrl: "https://visual.example/pr/1/abc/report/",
      },
    );

    expect(body).toContain("https://visual.example/pr/1/abc/report/");
    expect(body).toContain(
      'src="https://raw.githubusercontent.com/acme/repo/visual/pr-1/desktop-workcard-default-diff.png"',
    );
    expect(body).toContain("| expected | actual | diff |");
  });

  it("explains that new stories are not a regression", () => {
    const body = formatComment({
      changed: [],
      added: [{ title: "New › Story", project: "desktop" }],
      broken: [],
    });

    expect(body).toContain("**1 story has no baseline yet:**");
    expect(body).toContain("Nothing regressed");
    expect(body).not.toContain("visual-approved");
  });
});

describe("copyDiffs / resolveAttachmentPath", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = mkdtempSync(path.join(tmpdir(), "visual-summary-"));
  });

  afterEach(() => {
    rmSync(sandbox, { recursive: true, force: true });
  });

  it("maps a docker /work path onto the repo root", () => {
    const repoRoot = sandbox;
    const relative = "apps/storybook/test-results/diff.png";
    mkdirSync(path.dirname(path.join(repoRoot, relative)), { recursive: true });
    writeFileSync(path.join(repoRoot, relative), "png");

    expect(
      resolveAttachmentPath(`/work/${relative}`, {
        repoRoot,
        storybookRoot: path.join(repoRoot, "apps/storybook"),
      }),
    ).toBe(path.join(repoRoot, relative));
  });

  it("copies expected/actual/diff attachments under stable names", () => {
    const expected = path.join(sandbox, "expected.png");
    const actual = path.join(sandbox, "actual.png");
    const diff = path.join(sandbox, "diff.png");
    writeFileSync(expected, "e");
    writeFileSync(actual, "a");
    writeFileSync(diff, "d");

    const outputDir = path.join(sandbox, "out");
    const copied = copyDiffs(
      {
        changed: [
          {
            title: "WorkCard › Default",
            project: "desktop",
            ratio: 0.2,
            detail: "changed",
            attachments: [
              { name: "expected", path: expected },
              { name: "actual", path: actual },
              { name: "diff", path: diff },
            ],
          },
        ],
        added: [],
        broken: [],
      },
      outputDir,
    );

    expect(copied).toEqual([
      {
        title: "WorkCard › Default",
        project: "desktop",
        slug: "desktop-workcard-default",
        files: {
          expected: "desktop-workcard-default-expected.png",
          actual: "desktop-workcard-default-actual.png",
          diff: "desktop-workcard-default-diff.png",
        },
      },
    ]);
    expect(readFileSync(path.join(outputDir, "desktop-workcard-default-diff.png"), "utf8")).toBe(
      "d",
    );
  });
});

describe("visual-summary CLI", () => {
  it("prints a verdict and a comment from a report file", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "visual-cli-"));
    const reportPath = path.join(dir, "visual-results.json");
    writeFileSync(
      reportPath,
      JSON.stringify(
        report([
          spec("WorkCard › Default", "desktop", {
            status: "failed",
            error: { message: "toHaveScreenshot 12 pixels (ratio 0.01) are different" },
          }),
        ]),
      ),
    );

    try {
      const verdictOut = execFileSync(
        "node",
        [path.join(SCRIPT_DIR, "visual-summary.mjs"), "--verdict", reportPath],
        {
          encoding: "utf8",
        },
      );
      expect(verdictOut).toBe("mismatch-only\n");

      const comment = execFileSync(
        "node",
        [path.join(SCRIPT_DIR, "visual-summary.mjs"), reportPath],
        {
          encoding: "utf8",
        },
      );
      expect(comment).toContain("<!-- visual-regression -->");
      expect(comment).toContain("WorkCard › Default");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function report(specs) {
  return {
    suites: [
      {
        specs,
      },
    ],
  };
}

function spec(title, projectName, result) {
  return {
    title,
    ok: false,
    tests: [{ projectName, results: [result] }],
  };
}
