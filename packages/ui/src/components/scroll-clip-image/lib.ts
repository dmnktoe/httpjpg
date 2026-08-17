export const DEFAULT_MAX_CLIP_RATIO = 10;
export const DEFAULT_MAX_SCALE = 1.1;

export function getEntryProgress(rect: DOMRect, viewportHeight: number): number {
  const startDistance = viewportHeight;
  const endDistance = (viewportHeight - rect.height) / 2;
  const travel = startDistance - endDistance;
  if (travel <= 0) {
    return rect.top <= endDistance ? 1 : 0;
  }
  const consumed = startDistance - rect.top;
  return Math.max(0, Math.min(1, consumed / travel));
}

export function getPinProgress(rect: DOMRect, viewportHeight: number): number {
  const travel = rect.height - viewportHeight;
  if (travel <= 0) {
    return 1;
  }
  if (rect.top >= 0) {
    return 0;
  }
  if (rect.bottom <= viewportHeight) {
    return 1;
  }
  return Math.max(0, Math.min(1, -rect.top / travel));
}
