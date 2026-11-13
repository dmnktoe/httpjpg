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

function knownMediaRatio(item: DesktopMediaItem): number | undefined {
  if (
    typeof item.mediaWidth === "number" &&
    typeof item.mediaHeight === "number" &&
    item.mediaWidth > 0 &&
    item.mediaHeight > 0
  ) {
    return item.mediaWidth / item.mediaHeight;
  }
  return undefined;
}

/**
 * CSS aspect ratio for the media element. Videos of unknown size get none, so
 * `Video` takes its intrinsic-layout path and sizes itself from the metadata.
 */
export function desktopMediaAspectRatio(
  item: DesktopMediaItem,
  kind: DesktopMediaKind,
): string | undefined {
  if (knownMediaRatio(item)) {
    return `${item.mediaWidth}/${item.mediaHeight}`;
  }
  return kind === "video" ? undefined : IMAGE_FALLBACK_RATIO;
}

/** Numeric width / height the window is sized for; unknown sizes assume the usual shape per kind. */
export function desktopMediaLayoutRatio(item: DesktopMediaItem, kind: DesktopMediaKind): number {
  return knownMediaRatio(item) ?? (kind === "video" ? 16 / 9 : 4 / 3);
}

/**
 * Window width as a CSS expression. The media takes its height from the width,
 * so the height cap is applied by narrowing the window — capping the height
 * itself would crop the media and a video's native controls.
 */
export function desktopMediaWindowWidth(frameWidth: number, ratio: number): string {
  return `min(${frameWidth}px, calc(100vw - ${2 * DESKTOP_MEDIA_VIEWPORT_MARGIN_PX}px), calc(${DESKTOP_MEDIA_BODY_MAX_HEIGHT} * ${roundRatio(ratio)} + ${CHROME_X}))`;
}

/** Window height as a CSS expression; pass no ratio when the media size is unknown to get the cap. */
export function desktopMediaWindowHeight(frameWidth: number, ratio?: number): string {
  if (ratio === undefined) {
    return DESKTOP_MEDIA_MAX_HEIGHT;
  }
  return `calc((${desktopMediaWindowWidth(frameWidth, ratio)} - ${CHROME_X}) / ${roundRatio(ratio)} + ${CHROME_Y})`;
}

function roundRatio(ratio: number): number {
  return Math.round(ratio * 10000) / 10000;
}

/** Gap in px kept between a window and every viewport edge; matches the drag clamp. */
export const DESKTOP_MEDIA_VIEWPORT_MARGIN_PX = 8;

/** Tallest a window may get, title bar and borders included. */
export const DESKTOP_MEDIA_MAX_HEIGHT = "min(72vh, 800px)";

// Must match the window's styles: title bar `h: "8"` (2rem) and a 1px border all round.
const CHROME_X = "2px";
const CHROME_Y = "(2rem + 2px)";

/** Tallest the media itself may get inside a window. */
export const DESKTOP_MEDIA_BODY_MAX_HEIGHT = `(${DESKTOP_MEDIA_MAX_HEIGHT} - ${CHROME_Y})`;

const IMAGE_FALLBACK_RATIO = "4/3";
