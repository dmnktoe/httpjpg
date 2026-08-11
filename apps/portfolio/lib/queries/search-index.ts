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
  tag_list?: string[];
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

const TAXONOMY_TAGS = new Set(["Projects", "Websites"]);

const PER_PAGE = 100;

const MAX_PAGES = 20;

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
  const curated = resolveWorkTags(story.content?.tags);
  const curatedLabels = new Set(curated.map((tag) => tag.label));
  const loose = (story.tag_list ?? []).filter(
    (tag) => !TAXONOMY_TAGS.has(tag) && !curatedLabels.has(tag),
  );

  return {
    id: story.uuid,
    href: toHref(story),
    title: story.content?.title || story.name,
    kind: story.content?.component === "work" ? "work" : "page",
    tags: [...curatedLabels, ...loose],
    tagValues: curated.map((tag) => tag.value),
    excerpt: collectStoryText(story.content),
    date: story.content?.date,
    media: collectStoryMedia(story.content),
    ...(story.first_published_at === null ? { isDraft: true } : {}),
  };
}

export interface SearchIndexOptions {
  draftMode?: boolean;
}

async function buildIndex(draftMode: boolean): Promise<SearchDocument[]> {
  const api = getStoryblokApi({ draftMode });
  const stories: IndexableStory[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await api.getStories({
      per_page: PER_PAGE,
      page,
      version: draftMode ? "draft" : "published",
      ...(draftMode ? { cv: Date.now() } : {}),
    });
    stories.push(...((response.stories ?? []) as IndexableStory[]));

    const perPage = response.perPage || PER_PAGE;
    const total = response.total ?? stories.length;
    if (stories.length >= total || page * perPage >= total) {
      break;
    }
  }

  if (stories.length === 0) {
    throw new Error("Storyblok returned no stories for the search index");
  }

  return stories
    .filter((story) => !EXCLUDED_SLUGS.has(story.full_slug || story.slug))
    .map(toSearchDocument)
    .filter((document) => Boolean(document.title));
}

export async function getSearchIndex(options: SearchIndexOptions = {}): Promise<SearchDocument[]> {
  // Draft results bypass `unstable_cache` entirely. The cache is shared across
  // every visitor, so a draft written into it would outlive the preview
  // session that fetched it and leak unpublished work to the public index.
  if (options.draftMode) {
    return buildIndex(true);
  }

  return unstable_cache(() => buildIndex(false), ["search-index"], {
    tags: [CACHE_TAGS.STORIES],
    revalidate: 3600,
  })();
}
