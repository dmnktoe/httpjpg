import { storyblokEditable } from "@storyblok/react/rsc";
import type { SystemStyleObject } from "styled-system/types";

export interface BlokSpacing {
  mt?: string;
  mb?: string;
  ml?: string;
  mr?: string;
  pt?: string;
  pb?: string;
  pl?: string;
  pr?: string;
  mtMd?: string;
  mbMd?: string;
  mlMd?: string;
  mrMd?: string;
  ptMd?: string;
  pbMd?: string;
  plMd?: string;
  prMd?: string;
  mtLg?: string;
  mbLg?: string;
  mlLg?: string;
  mrLg?: string;
  ptLg?: string;
  pbLg?: string;
  plLg?: string;
  prLg?: string;
}

const AXES = ["mt", "mb", "ml", "mr", "pt", "pb", "pl", "pr"] as const;
type Axis = (typeof AXES)[number];

function responsive(base: string | undefined, md: string | undefined, lg: string | undefined) {
  if (!base && !md && !lg) {
    return undefined;
  }
  if (!md && !lg) {
    return base;
  }
  return {
    base: base ?? undefined,
    md: md ?? base ?? undefined,
    lg: lg ?? md ?? base ?? undefined,
  };
}

export function spacingCss(s: BlokSpacing): SystemStyleObject {
  const css: SystemStyleObject = {};
  for (const axis of AXES) {
    const value = responsive(
      s[axis],
      s[`${axis}Md` as Axis & `${Axis}Md`] as string | undefined,
      s[`${axis}Lg` as Axis & `${Axis}Lg`] as string | undefined,
    );
    if (value !== undefined) {
      (css as Record<string, unknown>)[axis] = value;
    }
  }
  return css;
}

export interface BlokWidth {
  width?: string;
  widthMd?: string;
  widthLg?: string;
}

export function widthCss(w: BlokWidth): SystemStyleObject {
  const value = responsive(w.width, w.widthMd, w.widthLg);
  return value === undefined ? {} : { width: value };
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

export function editableAttrs<T extends { _uid: string }>(blok: T) {
  return storyblokEditable(blok) || {};
}
