const EXTERNAL_PROTOCOLS = ["http://", "https://", "mailto:", "tel:"] as const;

export function isExternalLink(href: string): boolean {
  return EXTERNAL_PROTOCOLS.some((prefix) => href.startsWith(prefix));
}
