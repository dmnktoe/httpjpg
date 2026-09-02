const EXTERNAL_PROTOCOLS = ["http://", "https://", "mailto:", "tel:"] as const;
const SAFE_SCHEMES = ["http", "https", "mailto", "tel"];

export function isExternalLink(href: string): boolean {
  return EXTERNAL_PROTOCOLS.some((prefix) => href.startsWith(prefix));
}

/**
 * Reject `javascript:` (and other non-web schemes), including smuggling via
 * ASCII control characters that browsers ignore when resolving a URL.
 */
export function isSafeHref(href: string): boolean {
  const cleaned = Array.from(href)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 0x20 && code !== 0x7f;
    })
    .join("");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned);
  return !scheme || SAFE_SCHEMES.includes(scheme[1].toLowerCase());
}
