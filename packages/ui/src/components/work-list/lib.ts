import { spacing } from "@httpjpg/tokens";

/**
 * Snaps a spacing-scale value down to roughly half so phones don't inherit the
 * desktop rhythm verbatim. Values that aren't on the scale (`"2rem"`,
 * `"var(--x)"`) pass through untouched.
 */
export function compactSpacing(value: string | number): string | number {
  const step = Number(value);
  if (!Number.isFinite(step) || !SPACING_STEPS.includes(step)) {
    return value;
  }

  const halved = step / 2;
  let snapped = SPACING_STEPS[0];
  for (const candidate of SPACING_STEPS) {
    if (candidate <= halved) {
      snapped = candidate;
    }
  }
  return snapped;
}

/** Spacing-scale keys in ascending order — `[0, 1, 2, …, 96]`. */
const SPACING_STEPS = Object.keys(spacing)
  .map(Number)
  .sort((a, b) => a - b);
