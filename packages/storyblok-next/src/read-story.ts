import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { CMS_TAGS } from "./tags";

export interface ReadStoryOptions {
  /** Draft content through the preview token. Never cached. */
  draft?: boolean;
  /** Storyblok `resolve_relations`; order does not matter. */
  relations?: readonly string[];
  /** Field-level translation code (`de`). Omit for the space default. */
  language?: string;
}

/**
 * One story, read through the canonical caching policy:
 * - draft → request-time fetch through the preview token, never stored
 * - published → `use cache` under the `cms` lifetime, tagged with
 *   `CMS_TAGS.story(slug)` + `CMS_TAGS.stories` so the webhook can expire it
 */
export async function readStory(slug: string, options: ReadStoryOptions = {}) {
  const { draft = false, relations, language } = options;
  // Sorted so different call orders for the same set share one cache entry.
  const sortedRelations = relations ? [...relations].sort() : [];
  if (draft) {
    // Uncached by design, so it must not start during the request's prerender
    // pass — the CDN fetch would be aborted mid-flight and the client's
    // throttle reads `Date.now()`, which Cache Components rejects there.
    await connection();
    return loadStory(slug, sortedRelations, language, true);
  }
  return readPublishedStory(slug, sortedRelations, language);
}

async function readPublishedStory(slug: string, relations: string[], language?: string) {
  "use cache";
  cacheLife("cms");
  cacheTag(CMS_TAGS.story(slug), CMS_TAGS.stories);
  return loadStory(slug, relations, language, false);
}

async function loadStory(
  slug: string,
  relations: string[],
  language: string | undefined,
  draft: boolean,
) {
  const api = getStoryblokApi({ draftMode: draft });
  const resolveRelations = relations.length > 0 ? relations : undefined;
  const story = await api.getStory({
    slug,
    resolve_relations: resolveRelations,
    ...(language ? { language } : {}),
  });
  // `language=de` 404s when the space has no such locale yet. Retry the
  // default so `/de/cv` still renders until Internationalization is enabled.
  if (!story && language) {
    return api.getStory({ slug, resolve_relations: resolveRelations });
  }
  return story;
}
