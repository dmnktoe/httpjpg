import type { ScatterOptions } from "../../lib/desktop-scatter";
import { isSafeHref } from "../../lib/is-external-link";

export const DESKTOP_MEDIA_KINDS = ["image", "video"] as const;

export type DesktopMediaKind = (typeof DESKTOP_MEDIA_KINDS)[number];

export interface DesktopMediaItem {
  id: string;
  name: string;
  src: string;
  /** Overrides extension sniffing. */
  kind?: DesktopMediaKind;
  /** Frame width in px. Defaults to `DESKTOP_MEDIA_WIDTH`. */
  width?: number;
  alt?: string;
  srcSet?: string;
  sizes?: string;
  poster?: string;
  mediaWidth?: number;
  mediaHeight?: number;
}

/** Default frame width in px; the CMS dropdown default matches. */
export const DESKTOP_MEDIA_WIDTH = 400;

/** Windows are large: keep them off the right / bottom edge and further apart than icons. */
export const DESKTOP_MEDIA_SCATTER: ScatterOptions = {
  marginX: 4,
  marginY: 8,
  right: 32,
  bottom: 36,
  minDist: 28,
};

export function resolveDesktopMediaFrameWidth(width?: number): number {
  return typeof width === "number" && Number.isFinite(width) && width > 0
    ? width
    : DESKTOP_MEDIA_WIDTH;
}

export function desktopMediaSizesAttr(width: number): string {
  const frame = resolveDesktopMediaFrameWidth(width);
  return `(max-width: ${frame + 16}px) calc(100vw - 16px), ${frame}px`;
}

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|avi|mkv)(?:[?#]|$)/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(?:[?#]|$)/i;

export function isEmbedMediaUrl(src: string): boolean {
  return /(?:youtube\.com|youtu\.be|vimeo\.com)/i.test(src);
}

export function desktopMediaKindFromSrc(src: string): DesktopMediaKind | null {
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

export function resolveDesktopMediaKind(item: DesktopMediaItem): DesktopMediaKind | null {
  if (item.kind === "image" || item.kind === "video") {
    return item.kind;
  }
  return desktopMediaKindFromSrc(item.src);
}

export function visibleDesktopMedia(items: readonly DesktopMediaItem[]): DesktopMediaItem[] {
  return items.filter((item) => {
    const name = item.name.trim();
    const src = item.src.trim();
    return Boolean(name && src && isSafeHref(src) && resolveDesktopMediaKind(item));
  });
}

export function desktopMediaAspectRatio(item: DesktopMediaItem, kind: DesktopMediaKind): string {
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
