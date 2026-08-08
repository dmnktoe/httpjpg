// @vitest-environment node

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import { ENV_FILE, hasFlag, readOption, writeEnvVar } from "./cli";

function tempEnvFile(contents?: string): string {
  const file = join(mkdtempSync(join(tmpdir(), "credentials-")), ".env.local");
  if (contents !== undefined) {
    writeFileSync(file, contents);
  }
  return file;
}

describe("ENV_FILE", () => {
  it("points at the repo-root .env.local the scripts actually load", () => {
    // An off-by-one here writes secrets to a file nothing reads, silently.
    const repoRoot = resolve(__dirname, "../../../..");
    expect(ENV_FILE).toBe(join(repoRoot, ".env.local"));
    expect(existsSync(join(repoRoot, "pnpm-workspace.yaml"))).toBe(true);
  });
});

describe("readOption", () => {
  it("reads a space-separated flag", () => {
    expect(readOption(["--port", "8888"], "port")).toBe("8888");
  });

  it("reads an inline flag", () => {
    expect(readOption(["--port=8888"], "port")).toBe("8888");
  });

  it("returns undefined for a flag that is absent", () => {
    expect(readOption(["--write"], "port")).toBeUndefined();
  });

  it("does not confuse a flag with one that shares its prefix", () => {
    expect(readOption(["--npsso-file", "x"], "npsso")).toBeUndefined();
  });
});

describe("hasFlag", () => {
  it("detects a bare flag", () => {
    expect(hasFlag(["--write"], "write")).toBe(true);
    expect(hasFlag(["--port", "1"], "write")).toBe(false);
  });
});

describe("writeEnvVar", () => {
  it("creates the file when it does not exist yet", () => {
    const file = tempEnvFile();
    expect(writeEnvVar(file, "PSN_NPSSO", "abc")).toBe("added");
    expect(readFileSync(file, "utf8")).toBe('PSN_NPSSO="abc"\n');
  });

  it("replaces an existing key in place, leaving everything else alone", () => {
    const file = tempEnvFile('# comment\nSPOTIFY_CLIENT_ID="id"\nPSN_NPSSO="old"\nOTHER="keep"\n');

    expect(writeEnvVar(file, "PSN_NPSSO", "new")).toBe("updated");

    expect(readFileSync(file, "utf8")).toBe(
      '# comment\nSPOTIFY_CLIENT_ID="id"\nPSN_NPSSO="new"\nOTHER="keep"\n',
    );
  });

  it("appends a missing key without eating the last line", () => {
    const file = tempEnvFile('OTHER="keep"');

    expect(writeEnvVar(file, "PSN_NPSSO", "abc")).toBe("added");

    expect(readFileSync(file, "utf8")).toBe('OTHER="keep"\nPSN_NPSSO="abc"\n');
  });

  it("does not mistake a key that merely ends with the same name", () => {
    const file = tempEnvFile('LEGACY_PSN_NPSSO="other"\n');

    expect(writeEnvVar(file, "PSN_NPSSO", "abc")).toBe("added");

    const written = readFileSync(file, "utf8");
    expect(written).toContain('LEGACY_PSN_NPSSO="other"');
    expect(written).toContain('PSN_NPSSO="abc"');
  });
});
