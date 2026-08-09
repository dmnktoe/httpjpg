import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CACHE_TAGS } from "@httpjpg/storyblok-next";
import { unstable_cache } from "next/cache";

import type { SearchDocument } from "../search/ranking";
import { collectStoryText } from "../search/story-text";
import { STORYBLOK_SLUGS } from "../storyblok-slugs";

interface IndexableStory {
  uuid: string;
  slug: string;
  full_slug?: string;
  name: string;
  tag_list?: string[];
  content?: {
    component?: string;
    title?: string;
    date?: string;
    external_only?: boolean;
    link?: { url?: string; cached_url?: string };
  } & Record<string, unknown>;
}

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
  return {
    id: story.uuid,
    href: toHref(story),
    title: story.content?.title || story.name,
    kind: story.content?.component === "work" ? "work" : "page",
    tags: story.tag_list ?? [],
    excerpt: collectStoryText(story.content),
    date: story.content?.date,
  };
}

/** The published corpus both search and the ask endpoint read. */
export async function getSearchIndex(): Promise<SearchDocument[]> {
  const buildIndex = async (): Promise<SearchDocument[]> => {
    try {
      const response = await getStoryblokApi({ draftMode: false }).getStories({
        per_page: 100,
        version: "published",
      });

      return ((response.stories ?? []) as IndexableStory[])
        .filter((story) => !EXCLUDED_SLUGS.has(story.full_slug || story.slug))
        .map(toSearchDocument)
        .filter((document) => Boolean(document.title));
    } catch (error) {
      console.error("Error building search index:", error);
      captureServerException(error, { tags: { query: "search-index" } });
      return [];
    }
  };

  return unstable_cache(buildIndex, ["search-index"], {
    tags: [CACHE_TAGS.STORIES],
    revalidate: 3600,
  })();
}
