import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

import { accent, ASCII_ARROW, done, fail, heading, outro, step, warn } from "@httpjpg/terminal";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const ENV_FILE = resolve(PACKAGE_ROOT, "../../.env.local");

function prompt(label: string): string {
  return `  ${accent(ASCII_ARROW)} ${label} · `;
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

export async function ask(label: string): Promise<string> {
  if (!process.stdin.isTTY) {
    fail(`needed "${label}" but stdin is not a terminal · set it in .env.local or the environment`);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(prompt(label))).trim();
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
  heading(key.toLowerCase());
  console.log(`\n  ${key}="${value}"\n`);

  if (!shouldWrite) {
    step("re-run with --write to drop it into .env.local");
    outro();
    return;
  }

  const action = writeEnvVar(ENV_FILE, key, value);
  done(`${action} · ${ENV_FILE}`);
  warn("production reads its own env — paste it into the host too");
  outro();
}
