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
  options: {
    draftMode?: boolean;
    resolveRelations?: readonly string[];
    language?: string;
  } = {},
) {
  const { draftMode = false, resolveRelations, language } = options;
  // Sort + join so different call orders for the same set hit the same cache
  // entry, and different sets get distinct entries.
  const normalizedRelations = resolveRelations ? [...resolveRelations].sort() : [];
  const resolveRelationsKey = normalizedRelations.join(",");
  const resolveRelationsArg = normalizedRelations.length > 0 ? normalizedRelations : undefined;
  const languageKey = language || "default";

  async function load() {
    const api = draftMode ? getStoryblokApi({ draftMode: true }) : getStoryblokApi();
    const params = {
      slug,
      resolve_relations: resolveRelationsArg,
      ...(language ? { language } : {}),
    };
    const story = await api.getStory(params);
    // `language=de` 404s when the space has no such locale yet. Retry the
    // default so `/de/cv` still renders until Internationalization is enabled.
    if (!story && language) {
      return api.getStory({ slug, resolve_relations: resolveRelationsArg });
    }
    return story;
  }

  if (draftMode) {
    return load();
  }
  return unstable_cache(
    load,
    [`story-${slug}`, `relations-${resolveRelationsKey}`, `lang-${languageKey}`],
    {
      tags: [CACHE_TAGS.STORY(slug), CACHE_TAGS.STORIES],
      revalidate: 3600,
    },
  )();
}
