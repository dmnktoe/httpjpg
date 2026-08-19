export const DEFAULT_POSITION = 50;
export const MIN_POSITION = 0;
export const MAX_POSITION = 100;

export type ComparisonOrientation = "horizontal" | "vertical";

export function clampPosition(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_POSITION;
  }
  return Math.min(MAX_POSITION, Math.max(MIN_POSITION, value));
}

export function formatPositionLabel(position: number): string {
  return `[ ${String(Math.round(clampPosition(position))).padStart(3, "0")} / 100 ]`;
}

export function bracketLabel(label: string): string {
  return `[ ${label} ]`;
}

export function positionFromClient(
  clientX: number,
  clientY: number,
  rect: DOMRectReadOnly,
  orientation: ComparisonOrientation,
): number {
  if (rect.width === 0 || rect.height === 0) {
    return DEFAULT_POSITION;
  }
  const ratio =
    orientation === "horizontal"
      ? (clientX - rect.left) / rect.width
      : (clientY - rect.top) / rect.height;
  return clampPosition(ratio * 100);
}
