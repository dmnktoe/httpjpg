import { isSafeHref } from "../../lib/is-external-link";

export const DESKTOP_FILE_KINDS = [
  "pdf",
  "zip",
  "image",
  "video",
  "audio",
  "document",
  "file",
] as const;

export type DesktopFileKind = (typeof DESKTOP_FILE_KINDS)[number];

export interface DesktopDownloadItem {
  id: string;
  name: string;
  url: string;
  /** Overrides extension sniffing. */
  kind?: DesktopFileKind;
}

export interface DesktopIconPosition {
  left: number;
  top: number;
}

/**
 * Optional image URLs per file kind. Leave a kind unset to keep the drawn
 * placeholder — swap in 32×32 XP glyphs later (pixelated rendering is already on).
 */
export const DESKTOP_ICON_SRC: Partial<Record<DesktopFileKind, string>> = {};

export const DESKTOP_ICON_WIDTH = 76;
export const DESKTOP_ICON_HEIGHT = 86;
export const DESKTOP_ICON_MARGIN = 8;
export const DESKTOP_DRAG_THRESHOLD_PX = 4;

const KIND_BY_EXT: Record<string, DesktopFileKind> = {
  pdf: "pdf",
  zip: "zip",
  rar: "zip",
  "7z": "zip",
  gz: "zip",
  tgz: "zip",
  tar: "zip",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  avif: "image",
  bmp: "image",
  ico: "image",
  mp4: "video",
  mov: "video",
  webm: "video",
  mkv: "video",
  avi: "video",
  mp3: "audio",
  wav: "audio",
  flac: "audio",
  aac: "audio",
  ogg: "audio",
  m4a: "audio",
  doc: "document",
  docx: "document",
  txt: "document",
  rtf: "document",
  md: "document",
  pages: "document",
  ppt: "document",
  pptx: "document",
  xls: "document",
  xlsx: "document",
  csv: "document",
};

export function extensionOf(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let pathname = trimmed.split("#")[0] ?? trimmed;
  try {
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      pathname = new URL(trimmed).pathname;
    }
  } catch {
    pathname = (trimmed.split("?")[0] ?? trimmed).split("#")[0] ?? trimmed;
  }

  const base = (pathname.split("/").pop() ?? pathname).split("?")[0] ?? pathname;
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) {
    return null;
  }
  return base.slice(dot + 1).toLowerCase();
}

export function fileKindFromSource(name: string, url: string): DesktopFileKind {
  const ext = extensionOf(name) ?? extensionOf(url);
  return (ext && KIND_BY_EXT[ext]) || "file";
}

export function downloadFilename(name: string, url: string): string {
  const trimmed = name.trim();
  if (extensionOf(trimmed)) {
    return trimmed;
  }
  const fromUrl = extensionOf(url);
  const base = trimmed.replace(/[/\\?%*:|"<>]/g, "").trim() || "download";
  return fromUrl ? `${base}.${fromUrl}` : base;
}

export function visibleDesktopDownloads(items: DesktopDownloadItem[]): DesktopDownloadItem[] {
  return items.filter((item) => {
    const name = item.name.trim();
    const url = item.url.trim();
    return Boolean(name && url && isSafeHref(url));
  });
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
export function desktopIconPositions(ids: readonly string[]): DesktopIconPosition[] {
  const positions: DesktopIconPosition[] = [];
  const marginX = 6;
  const marginY = 12;
  const bottom = 18;
  const minDist = 12;

  for (let index = 0; index < ids.length; index += 1) {
    const seed = hashSeed(`${ids[index]}:${index}`);
    let left = marginX;
    let top = marginY;

    for (let attempt = 0; attempt < 14; attempt += 1) {
      left = marginX + unit(seed, 11 + attempt * 17) * (100 - marginX * 2 - 8);
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

export function clampDesktopIconPoint(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number } {
  const maxX = Math.max(
    DESKTOP_ICON_MARGIN,
    viewportWidth - DESKTOP_ICON_WIDTH - DESKTOP_ICON_MARGIN,
  );
  const maxY = Math.max(
    DESKTOP_ICON_MARGIN,
    viewportHeight - DESKTOP_ICON_HEIGHT - DESKTOP_ICON_MARGIN,
  );
  return {
    x: Math.min(maxX, Math.max(DESKTOP_ICON_MARGIN, x)),
    y: Math.min(maxY, Math.max(DESKTOP_ICON_MARGIN, y)),
  };
}

export function triggerDownload(url: string, name: string): boolean {
  const href = url.trim();
  if (!href || !isSafeHref(href)) {
    return false;
  }
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = downloadFilename(name, href);
  anchor.rel = "noopener noreferrer";
  anchor.target = "_blank";
  anchor.referrerPolicy = "no-referrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
  }
  return true;
}
