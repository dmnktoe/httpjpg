import { revalidateTag } from "next/cache";

import { CMS_TAGS } from "./tags";

/** `expire: 0`, not stale-while-revalidate: the next visitor gets the new content. */
export function expireStory(slug: string): string[] {
  return expireTags([CMS_TAGS.story(slug), CMS_TAGS.stories]);
}

export function expireConfig(): string[] {
  return expireTags([CMS_TAGS.config]);
}

function expireTags(tags: string[]): string[] {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
  return tags;
}
