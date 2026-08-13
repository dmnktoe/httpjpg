import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CACHE_TAGS } from "@httpjpg/storyblok-next";
import { resolveWorkTags } from "@httpjpg/storyblok-utils";
import { unstable_cache } from "next/cache";

import type { SearchDocument } from "../search/ranking";
import { collectStoryMedia } from "../search/story-media";
import { collectStoryText } from "../search/story-text";
import { STORYBLOK_SLUGS } from "../storyblok-slugs";

interface IndexableStory {
  uuid: string;
  slug: string;
  full_slug?: string;
  name: string;
  /** Null on a story that has never been published. Only asked for in draft mode. */
  first_published_at?: string | null;
  content?: {
    component?: string;
    title?: string;
    date?: string;
    external_only?: boolean;
    tags?: string[];
    link?: { url?: string; cached_url?: string };
  } & Record<string, unknown>;
}

const PER_PAGE = 100;

/** Backstop against a paging bug walking the CDN forever. */
const MAX_PAGES = 20;

/** Configuration stories, not readable pages. */
const EXCLUDED_SLUGS = new Set<string>([STORYBLOK_SLUGS.CONFIG]);

function toHref(story: IndexableStory): string {
  const fullSlug = story.full_slug || story.slug;

  if (story.content?.external_only === true) {
    const externalUrl = story.content.link?.url || story.content.link?.cached_url;
    if (externalUrl) {
      return externalUrl;
    }
  }

  return fullSlug === STORYBLOK_SLUGS.HOME ? "/" : `/${fullSlug}`;
}

function toSearchDocument(story: IndexableStory): SearchDocument {
  // Labels are what a visitor reads and what the model is shown; values are
  // the stable key related work compares. Both come off one resolve so they
  // can never disagree about which tags a story carries.
  const curated = resolveWorkTags(story.content?.tags);

  return {
    id: story.uuid,
    href: toHref(story),
    title: story.content?.title || story.name,
    kind: story.content?.component === "work" ? "work" : "page",
    tags: curated.map((tag) => tag.label),
    tagValues: curated.map((tag) => tag.value),
    excerpt: collectStoryText(story.content),
    date: story.content?.date,
    media: collectStoryMedia(story.content),
    ...(story.first_published_at === null ? { isDraft: true } : {}),
  };
}

async function buildIndex(draftMode: boolean): Promise<SearchDocument[]> {
  const api = getStoryblokApi({ draftMode });
  const stories: IndexableStory[] = [];

  // Paginated rather than capped at one page: a silent truncation would
  // simply drop later work out of search with nothing to show for it.
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await api.getStories({
      per_page: PER_PAGE,
      page,
      version: draftMode ? "draft" : "published",
      // Storyblok caches its own draft responses behind a version stamp, so an
      // edit would otherwise not reach a preview session for minutes.
      ...(draftMode ? { cv: Date.now() } : {}),
    });
    stories.push(...((response.stories ?? []) as IndexableStory[]));

    const perPage = response.perPage || PER_PAGE;
    const total = response.total ?? stories.length;
    if (stories.length >= total || page * perPage >= total) {
      break;
    }
  }

  // `getStories` swallows its own fetch errors and answers with an empty
  // page, so an outage is indistinguishable from an empty space. Throwing
  // keeps `unstable_cache` from storing it — otherwise a two-second blip
  // during a refill leaves search answering "no matches" for an hour. The
  // caller reports it and returns its error response.
  if (stories.length === 0) {
    throw new Error("Storyblok returned no stories for the search index");
  }

  return stories
    .filter((story) => !EXCLUDED_SLUGS.has(story.full_slug || story.slug))
    .map(toSearchDocument)
    .filter((document) => Boolean(document.title));
}

export interface SearchIndexOptions {
  draftMode?: boolean;
}

/** The corpus both search and the ask endpoint read. */
export async function getSearchIndex(options: SearchIndexOptions = {}): Promise<SearchDocument[]> {
  // Draft results bypass `unstable_cache` entirely. The cache is shared across
  // every visitor, so a draft written into it would outlive the preview session
  // that fetched it and leak unpublished work into the public index.
  if (options.draftMode) {
    return buildIndex(true);
  }

  return unstable_cache(() => buildIndex(false), ["search-index"], {
    tags: [CACHE_TAGS.STORIES],
    revalidate: 3600,
  })();
}
