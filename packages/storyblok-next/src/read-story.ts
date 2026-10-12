import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import { CMS_TAGS } from "./tags";

export interface ReadStoryOptions {
  /** Preview token, never cached. */
  draft?: boolean;
  /** `resolve_relations`, any order. */
  relations?: readonly string[];
  /** Translation code (`de`); omit for the default. */
  language?: string;
}

export async function readStory(slug: string, options: ReadStoryOptions = {}) {
  const { draft = false, relations, language } = options;
  // Sorted: one cache entry per relation set.
  const sortedRelations = relations ? [...relations].sort() : [];
  if (draft) {
    // Uncached: wait for request time, or the prerender pass aborts the fetch.
    await connection();
    return loadStory(slug, sortedRelations, language, true);
  }
  return readPublishedStory(slug, sortedRelations, language);
}

async function readPublishedStory(slug: string, relations: string[], language?: string) {
  "use cache";
  cacheTag(CMS_TAGS.story(slug), CMS_TAGS.stories);
  const story = await loadStory(slug, relations, language, false);
  if (!story) {
    // Null is a missing slug or a failed fetch: hold it for seconds, not the hour.
    // No throw: an error from a cache scope fails the page prerender.
    cacheLife("seconds");
    return story;
  }
  cacheLife("cms");
  return story;
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
  // Until the space has the locale, `language=de` 404s: fall back to default.
  if (!story && language) {
    return api.getStory({ slug, resolve_relations: resolveRelations });
  }
  return story;
}
