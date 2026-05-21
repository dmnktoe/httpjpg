export function getFaviconUrl(href: string, size = 16): string | null {
  try {
    const url = new URL(href);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`;
  } catch {
    return null;
  }
}
