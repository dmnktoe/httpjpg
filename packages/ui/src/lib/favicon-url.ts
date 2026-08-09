// Points at the portfolio's own /api/favicon proxy rather than Google's s2
// endpoint: s2 only takes a hostname, so project pages that share a host
// (dmnktoe.github.io/buli-tabelle) never resolve their own icon. The proxy
// keeps the full URL and reads the page's <link rel="icon">.
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
