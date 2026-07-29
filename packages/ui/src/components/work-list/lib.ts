import { spacing } from "@httpjpg/tokens";

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

const SPACING_STEPS = Object.keys(spacing)
  .map(Number)
  .sort((a, b) => a - b);
