import type { ScatterOptions } from "../../lib/desktop-scatter";
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

/**
 * Optional image URLs per file kind. Leave a kind unset to keep the drawn
 * placeholder — swap in 32×32 XP glyphs later (pixelated rendering is already on).
 */
export const DESKTOP_ICON_SRC: Partial<Record<DesktopFileKind, string>> = {};

/** Icons are small: tight margins, and they may sit closer together than media windows. */
export const DESKTOP_ICON_SCATTER: ScatterOptions = {
  marginX: 6,
  marginY: 12,
  right: 14,
  bottom: 18,
  minDist: 12,
};

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

function isSameOriginHref(href: string): boolean {
  if (
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("#")
  ) {
    return true;
  }
  try {
    return new URL(href, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function clickDownloadAnchor(
  href: string,
  filename: string,
  options: { openInNewTab: boolean },
): void {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  anchor.referrerPolicy = "no-referrer";
  if (options.openInNewTab) {
    anchor.target = "_blank";
  }
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
  }
}

async function downloadViaObjectUrl(href: string, filename: string): Promise<boolean> {
  const response = await fetch(href, {
    mode: "cors",
    credentials: "omit",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok) {
    return false;
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    // Object URLs are same-origin, so `download` is honored without opening a tab.
    clickDownloadAnchor(objectUrl, filename, { openInNewTab: false });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  return true;
}

/**
 * Start a file download. Same-origin URLs use the `download` attribute directly.
 * Cross-origin URLs are fetched as a blob first so the browser does not treat the
 * click as navigation (and open a new tab) when `Content-Disposition` is missing.
 * Falls back to a new-tab navigation only when the blob fetch fails.
 */
export function triggerDownload(url: string, name: string): boolean {
  const href = url.trim();
  if (!href || !isSafeHref(href)) {
    return false;
  }
  const filename = downloadFilename(name, href);

  if (isSameOriginHref(href)) {
    clickDownloadAnchor(href, filename, { openInNewTab: false });
    return true;
  }

  void downloadViaObjectUrl(href, filename).then(
    (ok) => {
      if (!ok) {
        clickDownloadAnchor(href, filename, { openInNewTab: true });
      }
    },
    () => {
      clickDownloadAnchor(href, filename, { openInNewTab: true });
    },
  );
  return true;
}
