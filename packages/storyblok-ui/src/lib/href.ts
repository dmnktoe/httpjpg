import type { StoryblokLink } from "@httpjpg/storyblok-utils";

export function storyblokHref(link?: StoryblokLink): string {
  if (!link) {
    return "";
  }
  const { linktype, url, cached_url, email, anchor } = link;
  if (linktype === "email") {
    return email ? `mailto:${email}` : "";
  }
  if (linktype === "url" || linktype === "asset") {
    return url || "";
  }
  const path = cached_url || url || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return anchor ? `${cleanPath}#${anchor}` : cleanPath;
}
