import type { StoryblokLink } from "./types";

/**
 * Get Next.js Link props from Storyblok link field
 */
export function getLinkPropsFromStoryblok(link: StoryblokLink): {
  href: string;
  target?: string;
  rel?: string;
} {
  if (!link) {
    return { href: "#" };
  }

  const { linktype, cached_url, url, story } = link;

  // External link
  if (linktype === "url" && url) {
    return {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }

  // Email link
  if (linktype === "email" && cached_url) {
    return {
      href: `mailto:${cached_url}`,
    };
  }

  // Asset link
  if (linktype === "asset" && url) {
    return {
      href: url,
      target: "_blank",
    };
  }

  // Internal story link
  if (linktype === "story") {
    const slug = story?.full_slug || cached_url || "";
    return {
      href: `/${slug}`,
    };
  }

  // Default to cached_url
  return {
    href: cached_url ? `/${cached_url}` : "#",
  };
}
