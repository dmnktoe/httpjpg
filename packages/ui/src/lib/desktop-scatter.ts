/** Seeded viewport scatter + clamping shared by the work-page desktop widgets. */

export interface ScatterPosition {
  /** Viewport % from the left. */
  left: number;
  /** Viewport % from the top. */
  top: number;
}

export interface ScatterOptions {
  /** Viewport % kept free on each side; `right` / `bottom` leave room for the item itself. */
  marginX: number;
  marginY: number;
  right: number;
  bottom: number;
  /** Minimum distance (viewport %) between two items before re-rolling. */
  minDist: number;
}

export interface ViewportPoint {
  x: number;
  y: number;
}

export interface BoxSize {
  width: number;
  height: number;
}

/** FNV-1a. Stable across renders and SSR, unlike `Math.random()`. */
export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (const char of input) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Seeded scatter in viewport percentages, with a light anti-overlap pass. */
export function scatterPositions(
  ids: readonly string[],
  { marginX, marginY, right, bottom, minDist }: ScatterOptions,
): ScatterPosition[] {
  const positions: ScatterPosition[] = [];

  for (let index = 0; index < ids.length; index += 1) {
    const seed = hashSeed(`${ids[index]}:${index}`);
    let left = marginX;
    let top = marginY;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      left = marginX + unit(seed, 11 + attempt * 17) * (100 - marginX - right);
      top = marginY + unit(seed, 29 + attempt * 13) * (100 - marginY - bottom);
      const collides = positions.some((position) => {
        const dx = position.left - left;
        const dy = position.top - top;
        return dx * dx + dy * dy < minDist * minDist;
      });
      if (!collides) {
        break;
      }
    }

    positions.push({ left, top });
  }

  return positions;
}

/** Keep a box of `size` fully inside the viewport, `margin` px from every edge. */
export function clampToViewport(
  point: ViewportPoint,
  viewport: BoxSize,
  size: BoxSize,
  margin: number,
): ViewportPoint {
  const maxX = Math.max(margin, viewport.width - size.width - margin);
  const maxY = Math.max(margin, viewport.height - size.height - margin);
  return {
    x: Math.min(maxX, Math.max(margin, point.x)),
    y: Math.min(maxY, Math.max(margin, point.y)),
  };
}

function unit(hash: number, salt: number): number {
  const mixed = Math.imul(hash ^ (salt >>> 0), 1597334677) >>> 0;
  return mixed / 0x1_0000_0000;
}

const MAX_ATTEMPTS = 14;
