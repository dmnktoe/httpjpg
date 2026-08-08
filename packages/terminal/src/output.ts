import {
  ASCII_ARROW,
  ASCII_DIVIDER_DOTS,
  ASCII_DIVIDER_STARS,
  ASCII_SPARKLES,
  MARK_DONE,
  MARK_FAIL,
  MARK_STEP,
  MARK_WARN,
} from "./ascii";
import { accent, bold, danger, dim, primary, success, warning } from "./color";

export function banner(title: string): void {
  console.log(`\n${accent(ASCII_DIVIDER_STARS)}`);
  console.log(`${accent(ASCII_ARROW)} ${bold(title)}`);
  console.log(`${accent(ASCII_DIVIDER_STARS)}\n`);
}

export function heading(title: string): void {
  console.log(`\n${accent(ASCII_ARROW)} ${bold(title)}`);
  console.log(dim(ASCII_DIVIDER_DOTS));
}

export function step(message: string): void {
  console.log(`  ${dim(MARK_STEP)} ${dim(message)}`);
}

export function done(message: string): void {
  console.log(`  ${success(MARK_DONE)} ${message}`);
}

export function warn(message: string): void {
  console.warn(`  ${warning(MARK_WARN)} ${warning(message)}`);
}

export function note(message: string): void {
  console.log(`  ${primary(MARK_STEP)} ${message}`);
}

export function outro(message?: string): void {
  if (message) {
    console.log(`\n  ${message}`);
  }
  console.log(`\n${accent(ASCII_SPARKLES)}\n`);
}

export function fail(message: string): never {
  console.error(`\n  ${danger(MARK_FAIL)} ${danger(message)}`);
  console.error(dim(ASCII_DIVIDER_DOTS));
  process.exit(1);
}
