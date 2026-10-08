import { revalidateTag } from "next/cache";

import { CMS_TAGS } from "./tags";

/**
 * Expires a published story and everything that lists it. Returns the tags it
 * touched so the webhook can report them.
 *
 * `expire: 0` rather than stale-while-revalidate: after a publish the next
 * visitor waits for the new content instead of being served the old one.
 */
export function expireStory(slug: string): string[] {
  return expireTags([CMS_TAGS.story(slug), CMS_TAGS.stories]);
}

/** Expires the site-wide config story (nav, footer, widget toggles). */
export function expireConfig(): string[] {
  return expireTags([CMS_TAGS.config]);
}

function expireTags(tags: string[]): string[] {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
  return tags;
}
