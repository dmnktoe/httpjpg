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
  content?: {
    component?: string;
    title?: string;
    date?: string;
    external_only?: boolean;
    tags?: string[];
    link?: { url?: string; cached_url?: string };
  } & Record<string, unknown>;
}

/**
 * Story-level Storyblok tags that categorise the work list rather than
 * describe the work. They stay out of the searchable tag set — a query for
 * "projects" should not match every project.
 */
const TAXONOMY_TAGS = new Set(["Projects", "Websites"]);

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
  // Curated tags first: they are the vocabulary the editor chose from, so they
  // are the ones worth showing and the ones related work can compare across
  // stories. Loose story tags trail behind as extra search surface.
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
  };
}

/** The published corpus both search and the ask endpoint read. */
export async function getSearchIndex(): Promise<SearchDocument[]> {
  const buildIndex = async (): Promise<SearchDocument[]> => {
    const api = getStoryblokApi({ draftMode: false });
    const stories: IndexableStory[] = [];

    // Paginated rather than capped at one page: a silent truncation would
    // simply drop later work out of search with nothing to show for it.
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const response = await api.getStories({
        per_page: PER_PAGE,
        page,
        version: "published",
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
      throw new Error("Storyblok returned no published stories for the search index");
    }

    return stories
      .filter((story) => !EXCLUDED_SLUGS.has(story.full_slug || story.slug))
      .map(toSearchDocument)
      .filter((document) => Boolean(document.title));
  };

  return unstable_cache(buildIndex, ["search-index"], {
    tags: [CACHE_TAGS.STORIES],
    revalidate: 3600,
  })();
}
