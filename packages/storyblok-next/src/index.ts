import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { unstable_cache } from "next/cache";

export const CACHE_TAGS = {
  STORY: (slug: string) => `story-${slug}`,
  STORIES: "stories",
  CONFIG: "storyblok-config",
} as const;

/**
 * Fetch a story with the canonical caching policy:
 * - draft mode → fresh fetch, never cached
 * - production → `unstable_cache` tagged with `STORY(slug)` + `STORIES`,
 *   revalidates every hour AND on webhook
 */
export async function fetchStory(
  slug: string,
  options: { draftMode?: boolean; resolveRelations?: readonly string[] } = {},
) {
  const { draftMode = false, resolveRelations } = options;
  // Sort + join so different call orders for the same set hit the same cache
  // entry, and different sets get distinct entries.
  const normalizedRelations = resolveRelations ? [...resolveRelations].sort() : [];
  const resolveRelationsKey = normalizedRelations.join(",");
  const resolveRelationsArg = normalizedRelations.length > 0 ? normalizedRelations : undefined;

  if (draftMode) {
    return getStoryblokApi({ draftMode: true }).getStory({
      slug,
      resolve_relations: resolveRelationsArg,
    });
  }
  return unstable_cache(
    () => getStoryblokApi().getStory({ slug, resolve_relations: resolveRelationsArg }),
    [`story-${slug}`, `relations-${resolveRelationsKey}`],
    {
      tags: [CACHE_TAGS.STORY(slug), CACHE_TAGS.STORIES],
      revalidate: 3600,
    },
  )();
}
