import { spacing } from "@httpjpg/tokens";

/** Spacing sides on the signed `CMS_OPTIONS.margin` scale. Padding stays positive-only. */
export const MARGIN_SIDES = ["mt", "mb", "ml", "mr"] as const;

export function isMarginSide(side: string): boolean {
  return (MARGIN_SIDES as readonly string[]).includes(side);
}

/** CSS length for a spacing or margin key: `"4"` → `"1rem"`, `"-4"` → `"-1rem"`. */
export function spacingValue(key?: string): string | undefined {
  if (!key) {
    return undefined;
  }
  const isNegative = key.startsWith("-");
  const unsigned = isNegative ? key.slice(1) : key;
  const value = (spacing as Record<string, string>)[unsigned];
  if (!value) {
    return undefined;
  }
  if (!isNegative) {
    return value;
  }
  return unsigned === "0" ? undefined : `-${value}`;
}

/** Datasource / select label: `"-4 (-1rem)"`. Unknown keys stay bare. */
export function spacingLabel(key: string): string {
  const value = spacingValue(key);
  return value ? `${key} (${value})` : key;
}
