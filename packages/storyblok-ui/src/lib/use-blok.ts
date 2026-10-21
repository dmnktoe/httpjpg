import type { BlokSpacing } from "@httpjpg/storyblok-utils";
import { spacingVar } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import type { CSSProperties } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export type { BlokSpacing };

const AXES = ["mt", "mb", "ml", "mr", "pt", "pb", "pl", "pr"] as const;
type Axis = (typeof AXES)[number];
type Breakpoint = "base" | "md" | "lg";

/** Classes and the variables they read; spread both onto the blok's root. */
export interface BlokStyle {
  css: SystemStyleObject;
  style: CSSProperties;
}

/**
 * Every spacing class a blok can need, written out once so Panda generates exactly
 * these. The CMS value travels in the `--sb-*` variable next to the class, so no
 * value list has to be pre-generated and production hashing can't drift from it.
 */
const SPACING_BRIDGE = css.raw({
  mt: { base: "var(--sb-mt)", md: "var(--sb-mt-md)", lg: "var(--sb-mt-lg)" },
  mb: { base: "var(--sb-mb)", md: "var(--sb-mb-md)", lg: "var(--sb-mb-lg)" },
  ml: { base: "var(--sb-ml)", md: "var(--sb-ml-md)", lg: "var(--sb-ml-lg)" },
  mr: { base: "var(--sb-mr)", md: "var(--sb-mr-md)", lg: "var(--sb-mr-lg)" },
  pt: { base: "var(--sb-pt)", md: "var(--sb-pt-md)", lg: "var(--sb-pt-lg)" },
  pb: { base: "var(--sb-pb)", md: "var(--sb-pb-md)", lg: "var(--sb-pb-lg)" },
  pl: { base: "var(--sb-pl)", md: "var(--sb-pl-md)", lg: "var(--sb-pl-lg)" },
  pr: { base: "var(--sb-pr)", md: "var(--sb-pr-md)", lg: "var(--sb-pr-lg)" },
}) as Record<Axis, Record<Breakpoint, string>>;

const WIDTH_BRIDGE = css.raw({
  width: { base: "var(--sb-w)", md: "var(--sb-w-md)", lg: "var(--sb-w-lg)" },
}).width as Record<Breakpoint, string>;

/**
 * Only the breakpoints the editor set get a class: `min-width` queries already
 * carry a value up to larger screens, and an unset variable would wipe the
 * component's own value instead of leaving it alone.
 */
function bridge(
  classes: Record<Breakpoint, string>,
  varName: string,
  steps: Record<Breakpoint, string | undefined>,
): { css?: Partial<Record<Breakpoint, string>>; style: Record<string, string> } {
  const cssValue: Partial<Record<Breakpoint, string>> = {};
  const style: Record<string, string> = {};
  for (const bp of ["base", "md", "lg"] as const) {
    const value = steps[bp];
    if (value) {
      cssValue[bp] = classes[bp];
      style[bp === "base" ? varName : `${varName}-${bp}`] = value;
    }
  }
  return { css: Object.keys(cssValue).length ? cssValue : undefined, style };
}

export function spacingStyle(s: BlokSpacing): BlokStyle {
  const classes: Record<string, unknown> = {};
  const style: Record<string, string> = {};
  for (const axis of AXES) {
    const result = bridge(SPACING_BRIDGE[axis], `--sb-${axis}`, {
      base: spacingVar(s[axis]),
      md: spacingVar(s[`${axis}Md`]),
      lg: spacingVar(s[`${axis}Lg`]),
    });
    if (result.css) {
      classes[axis] = result.css;
      Object.assign(style, result.style);
    }
  }
  return { css: classes as SystemStyleObject, style: style as CSSProperties };
}

export interface BlokWidth {
  width?: string;
  widthMd?: string;
  widthLg?: string;
}

export function widthStyle(w: BlokWidth): BlokStyle {
  const result = bridge(WIDTH_BRIDGE, "--sb-w", {
    base: w.width || undefined,
    md: w.widthMd || undefined,
    lg: w.widthLg || undefined,
  });
  return {
    css: result.css ? { width: result.css } : {},
    style: result.style as CSSProperties,
  };
}

/** Classes from left to right, later ones winning per property; variables merged likewise. */
export function mergeBlokStyles(...styles: BlokStyle[]): BlokStyle {
  return {
    css: Object.assign({}, ...styles.map((s) => s.css)),
    style: Object.assign({}, ...styles.map((s) => s.style)),
  };
}

/** Empty widths default to `100vw` — safe upper bound, browser may over-fetch a notch. */
export function sizesFromWidths(w: BlokWidth): string {
  const toVw = (v: string) => v.replace("%", "vw");
  const parts: string[] = [];
  if (w.widthLg) {
    parts.push(`(min-width: 1024px) ${toVw(w.widthLg)}`);
  }
  if (w.widthMd) {
    parts.push(`(min-width: 768px) ${toVw(w.widthMd)}`);
  }
  parts.push(toVw(w.width || "100%"));
  return parts.join(", ");
}

export function editableAttrs<T extends { _uid: string; _editable?: string }>(blok: T) {
  return storyblokEditable(blok) || {};
}
