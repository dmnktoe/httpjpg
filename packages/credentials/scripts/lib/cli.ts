import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const ENV_FILE = resolve(PACKAGE_ROOT, "../../.env.local");

export function heading(title: string): void {
  console.log(`\n${title}\n${"─".repeat(title.length)}`);
}

export function done(message: string): void {
  console.log(`✅ ${message}`);
}

export function warn(message: string): void {
  console.warn(`⚠️  ${message}`);
}

export function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

export function readOption(argv: string[], flag: string): string | undefined {
  const inline = argv.find((arg) => arg.startsWith(`--${flag}=`));
  if (inline) {
    return inline.slice(flag.length + 3);
  }
  const index = argv.indexOf(`--${flag}`);
  return index >= 0 ? argv[index + 1] : undefined;
}

export function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(`--${flag}`);
}

export async function ask(question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    fail(
      `Needed "${question.replace(/:\s*$/, "")}" but stdin is not a terminal — set it in .env.local or the environment.`,
    );
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

export function writeEnvVar(file: string, key: string, value: string): "updated" | "added" {
  const existing = existsSync(file) ? readFileSync(file, "utf8") : "";
  const line = `${key}="${value}"`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(existing)) {
    writeFileSync(file, existing.replace(pattern, line));
    return "updated";
  }

  const separator = existing.length === 0 || existing.endsWith("\n") ? "" : "\n";
  writeFileSync(file, `${existing}${separator}${line}\n`);
  return "added";
}

export function reportSecret(key: string, value: string, shouldWrite: boolean): void {
  heading(key);
  console.log(`${key}="${value}"\n`);

  if (!shouldWrite) {
    console.log(`Re-run with --write to put it into ${ENV_FILE} for you.`);
    return;
  }

  const action = writeEnvVar(ENV_FILE, key, value);
  done(`${action === "updated" ? "Updated" : "Added"} ${key} in ${ENV_FILE}`);
  warn("Remember to update the same value in your hosting provider's env settings.");
}
