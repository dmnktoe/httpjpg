export const OG_IMAGE_WIDTH = 280;
export const OG_IMAGE_HEIGHT = 210;
export const OG_ASCII_COLS = 115;
export const OG_ASCII_ROWS = 14;

const STORYBLOK_HOST = "a.storyblok.com";
const STORYBLOK_PROTOCOL_RELATIVE = `//${STORYBLOK_HOST}/`;

// Rejects non-Storyblok origins to prevent SSRF via CMS image fields.
export function toAbsoluteStoryblokUrl(url: string): string | null {
  if (!url) {
    return null;
  }
  const absolute = url.startsWith(STORYBLOK_PROTOCOL_RELATIVE) ? `https:${url}` : url;
  let parsed: URL;
  try {
    parsed = new URL(absolute);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== STORYBLOK_HOST) {
    return null;
  }
  return parsed.toString();
}

export function toOgImageUrl(filename: string): string | null {
  const safe = toAbsoluteStoryblokUrl(filename);
  return safe && `${safe}/m/${OG_IMAGE_WIDTH}x${OG_IMAGE_HEIGHT}/smart`;
}

export function toOgAsciiSampleUrl(filename: string): string | null {
  const safe = toAbsoluteStoryblokUrl(filename);
  return safe && `${safe}/m/400x150/filters:format(jpg):grayscale()`;
}

export function formatYear(date: string | undefined): string {
  if (!date) {
    return "";
  }
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.getFullYear().toString();
}

export function pickTitleSize(title: string): number {
  if (title.length > 32) return 72;
  if (title.length > 22) return 96;
  if (title.length > 14) return 120;
  return 144;
}
