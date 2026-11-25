/**
 * Viewport scaling for a composed page: the layout is built once at a design
 * width and the whole page then scales with the viewport like an image,
 * instead of reflowing between breakpoints.
 *
 * It works through the root font size. Spacing and type are `rem`, widths are
 * percentages, so tying `1rem` to the viewport scales everything in step. One
 * design width per CMS breakpoint band (base / `md` / `lg`), because a grid
 * picks its columns per band.
 */

export interface PageScale {
  /** Design width from `lg` up. */
  desktop: number;
  /** Design width from `md` to `lg`. */
  tablet: number;
  /** Design width below `md`. */
  mobile: number;
}

/** The page fields the scale is read from; Storyblok sends numbers as strings at times. */
export interface PageScaleSource {
  scaleWithViewport?: unknown;
  designWidth?: unknown;
  designWidthTablet?: unknown;
  designWidthMobile?: unknown;
}

export const DEFAULT_DESIGN_WIDTHS: PageScale = { desktop: 1440, tablet: 834, mobile: 390 };

const MIN_DESIGN_WIDTH = 240;
const MAX_DESIGN_WIDTH = 7680;

const SCALE_VARS = {
  desktop: "--page-scale-desktop",
  tablet: "--page-scale-tablet",
  mobile: "--page-scale-mobile",
} as const;

/** Null unless the page opted in; an unusable width falls back to its default. */
export function parsePageScale(source?: PageScaleSource | null): PageScale | null {
  if (source?.scaleWithViewport !== true) {
    return null;
  }
  return {
    desktop: designWidth(source.designWidth, DEFAULT_DESIGN_WIDTHS.desktop),
    tablet: designWidth(source.designWidthTablet, DEFAULT_DESIGN_WIDTHS.tablet),
    mobile: designWidth(source.designWidthMobile, DEFAULT_DESIGN_WIDTHS.mobile),
  };
}

/** Root font sizes per band: `1rem` is 16px exactly at the band's design width. */
export function pageScaleCssVars(
  scale: PageScale | null,
): Record<`--${string}`, string> | undefined {
  if (!scale) {
    return undefined;
  }
  return {
    [SCALE_VARS.desktop]: rootFontSize(scale.desktop),
    [SCALE_VARS.tablet]: rootFontSize(scale.tablet),
    [SCALE_VARS.mobile]: rootFontSize(scale.mobile),
  };
}

/** Sets or clears the scale on `<html>`; `[data-page-scale]` is what the stylesheet keys on. */
export function applyPageScale(root: HTMLElement, scale: PageScale | null): void {
  const vars = pageScaleCssVars(scale);
  if (!vars) {
    delete root.dataset.pageScale;
    for (const name of Object.values(SCALE_VARS)) {
      root.style.removeProperty(name);
    }
    return;
  }
  root.dataset.pageScale = "";
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}

function designWidth(value: unknown, fallback: number): number {
  const width = typeof value === "string" && value.trim() ? Number(value) : value;
  if (typeof width !== "number" || !Number.isFinite(width)) {
    return fallback;
  }
  return width >= MIN_DESIGN_WIDTH && width <= MAX_DESIGN_WIDTH ? width : fallback;
}

/** `100vw` is the design width there, so `1600 / width` vw is 16px. */
function rootFontSize(width: number): string {
  return `${Number((1600 / width).toFixed(4))}vw`;
}
