import { isExternalLink } from "./is-external-link";

export const EXTERNAL_LINK_CURSOR =
  'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><text x="0" y="15" font-size="16">↗</text></svg>\') 10 5, pointer';

export interface ExternalHref {
  external: boolean;
  showIcon: boolean;
  rel?: "noopener noreferrer";
  target?: "_blank";
}

export function resolveExternalHref(
  href: string,
  isExternal?: boolean,
  showExternalIcon?: boolean,
): ExternalHref {
  const external = isExternal ?? isExternalLink(href);
  if (!external) {
    return { external: false, showIcon: showExternalIcon ?? false };
  }
  return {
    external: true,
    showIcon: showExternalIcon ?? true,
    rel: "noopener noreferrer",
    target: "_blank",
  };
}
