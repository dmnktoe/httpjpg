export function getFaviconUrl(href: string, size = 16): string | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return `/api/favicon?url=${encodeURIComponent(url.href)}&sz=${size}`;
  } catch {
    return null;
  }
}
