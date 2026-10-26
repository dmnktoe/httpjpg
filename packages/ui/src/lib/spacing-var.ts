import { type Token, token } from "styled-system/tokens";

/**
 * Value for a custom property that a static class reads, e.g. `gap: var(--grid-gap)`.
 * Runtime values (CMS fields, props) can't get a class of their own without a
 * pre-generated list, so the class stays fixed and only the variable changes.
 *
 * Spacing keys (`"4"`, `24`, `"-2"`) resolve through the token map, which survives
 * production hashing. Anything else (`"1rem"`, `"10%"`) passes through; bare numbers
 * outside the scale become pixels.
 */
export function spacingVar(value: string | number | null | undefined): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const key = String(value);
  const path = `spacing.${key}` as Token;
  // Negative tokens point their `variable` at the positive one; the value carries the `calc()`.
  const resolved = key.startsWith("-") ? token(path) : token.var(path);
  if (resolved) {
    return resolved;
  }
  return typeof value === "number" ? `${value}px` : key;
}

/** A spacing value per breakpoint, as Panda writes it (`{ base: 4, md: 8 }`). */
export type ResponsiveSpacing =
  | string
  | number
  | { base?: string | number; md?: string | number; lg?: string | number };

/**
 * `--name`, `--name-md`, `--name-lg` for a class that reads all three, e.g.
 * `px: { base: "var(--x)", md: "var(--x-md)", lg: "var(--x-lg)" }`. Each breakpoint
 * falls back to the one below, so the class never meets an unset variable.
 */
export function responsiveSpacingVars(
  name: string,
  value: ResponsiveSpacing,
): Record<string, string> {
  // `null` guards untyped callers (Storybook args, CMS fields), which would otherwise throw here.
  const steps = value !== null && typeof value === "object" ? value : { base: value };
  const base = spacingVar(steps.base) ?? "0";
  const md = spacingVar(steps.md) ?? base;
  const lg = spacingVar(steps.lg) ?? md;
  return { [`--${name}`]: base, [`--${name}-md`]: md, [`--${name}-lg`]: lg };
}
