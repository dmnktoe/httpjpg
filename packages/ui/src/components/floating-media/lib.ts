import { isSafeHref } from "../../lib/is-external-link";

export const FLOATING_MEDIA_KINDS = ["image", "video"] as const;

export type FloatingMediaKind = (typeof FLOATING_MEDIA_KINDS)[number];

export interface FloatingMediaItem {
  id: string;
  name: string;
  src: string;
  /** Overrides extension sniffing. */
  kind?: FloatingMediaKind;
  alt?: string;
  srcSet?: string;
  sizes?: string;
  poster?: string;
  mediaWidth?: number;
  mediaHeight?: number;
}

export interface FloatingMediaPosition {
  left: number;
  top: number;
}

export const FLOATING_MEDIA_WIDTH = 400;
export const FLOATING_MEDIA_MARGIN = 8;
export const FLOATING_MEDIA_DRAG_THRESHOLD_PX = 4;
export const FLOATING_MEDIA_TITLEBAR_HEIGHT = 32;
export const FLOATING_MEDIA_SIZES = "(max-width: 416px) calc(100vw - 16px), 400px";

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|avi|mkv)(?:[?#]|$)/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(?:[?#]|$)/i;

export function isEmbedMediaUrl(src: string): boolean {
  return /(?:youtube\.com|youtu\.be|vimeo\.com)/i.test(src);
}

export function floatingMediaKindFromSrc(src: string): FloatingMediaKind | null {
  const trimmed = src.trim();
  if (!trimmed || isEmbedMediaUrl(trimmed)) {
    return null;
  }
  if (VIDEO_EXT.test(trimmed)) {
    return "video";
  }
  if (IMAGE_EXT.test(trimmed)) {
    return "image";
  }
  return null;
}

export function resolveFloatingMediaKind(item: FloatingMediaItem): FloatingMediaKind | null {
  if (item.kind === "image" || item.kind === "video") {
    return item.kind;
  }
  return floatingMediaKindFromSrc(item.src);
}

export function visibleFloatingMedia(items: readonly FloatingMediaItem[]): FloatingMediaItem[] {
  return items.filter((item) => {
    const name = item.name.trim();
    const src = item.src.trim();
    return Boolean(name && src && isSafeHref(src) && resolveFloatingMediaKind(item));
  });
}

export function floatingMediaAspectRatio(item: FloatingMediaItem, kind: FloatingMediaKind): string {
  if (
    typeof item.mediaWidth === "number" &&
    typeof item.mediaHeight === "number" &&
    item.mediaWidth > 0 &&
    item.mediaHeight > 0
  ) {
    return `${item.mediaWidth}/${item.mediaHeight}`;
  }
  return kind === "video" ? "16/9" : "4/3";
}

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (const char of input) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function unit(hash: number, salt: number): number {
  const mixed = Math.imul(hash ^ (salt >>> 0), 1597334677) >>> 0;
  return mixed / 0x1_0000_0000;
}

/** Seeded scatter in viewport percentages, with a light anti-overlap pass. */
export function floatingMediaPositions(ids: readonly string[]): FloatingMediaPosition[] {
  const positions: FloatingMediaPosition[] = [];
  const marginX = 4;
  const marginY = 8;
  const right = 32;
  const bottom = 36;
  const minDist = 28;

  for (let index = 0; index < ids.length; index += 1) {
    const seed = hashSeed(`${ids[index]}:${index}`);
    let left = marginX;
    let top = marginY;

    for (let attempt = 0; attempt < 14; attempt += 1) {
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

export function clampFloatingMediaPoint(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  size: { width: number; height: number },
): { x: number; y: number } {
  const margin = FLOATING_MEDIA_MARGIN;
  const maxX = Math.max(margin, viewportWidth - size.width - margin);
  const maxY = Math.max(margin, viewportHeight - size.height - margin);
  return {
    x: Math.min(maxX, Math.max(margin, x)),
    y: Math.min(maxY, Math.max(margin, y)),
  };
}
