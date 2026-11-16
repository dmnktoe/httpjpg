import { spacing } from "@httpjpg/tokens";

/** Spacing sides on the signed `CMS_OPTIONS.margin` scale. Padding stays positive-only. */
const MARGIN_SIDES = ["mt", "mb", "ml", "mr"] as const;

export function isMarginSide(side: string): boolean {
  return (MARGIN_SIDES as readonly string[]).includes(side);
}

/** Panda spacing token for a CMS key: `"−4"` → `"-4"`. Storyblok rejects a leading `-`. */
export function spacingToken(key?: string): string | undefined {
  return key?.startsWith(MINUS) ? `-${key.slice(1)}` : key;
}

/** CSS length for a spacing or margin key: `"4"` → `"1rem"`, `"−4"` / `"-4"` → `"-1rem"`. */
export function spacingValue(cmsKey?: string): string | undefined {
  const key = spacingToken(cmsKey);
  if (!key) {
    return undefined;
  }
  const isNegative = key.startsWith("-");
  const unsigned = isNegative ? key.slice(1) : key;
  // Keys come from CMS content: `"constructor"` must not reach the prototype.
  if (!Object.prototype.hasOwnProperty.call(spacing, unsigned)) {
    return undefined;
  }
  const value = (spacing as Record<string, string>)[unsigned];
  if (!isNegative) {
    return value;
  }
  return unsigned === "0" ? undefined : `-${value}`;
}

/** Datasource / select label: `"−4 (−1rem)"`. Unknown keys stay bare. */
export function spacingLabel(key: string): string {
  const value = spacingValue(key);
  return value ? `${key} (${value})`.replace(/-/g, MINUS) : key;
}

const MINUS = "\u2212";
