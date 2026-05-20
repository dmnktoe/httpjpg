import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CACHE_TAGS, fetchStory } from "@httpjpg/storyblok-next";
import { firstImageFilename, imagePreset, STORYBLOK_RELATIONS } from "@httpjpg/storyblok-utils";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { STORYBLOK_SLUGS } from "../storyblok-slugs";

export interface WorkItem {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string;
  isDraft: boolean;
  isExternal: boolean;
  date?: string;
}

export interface AdjacentWork {
  slug: string;
  title: string;
}

interface WorkStory {
  uuid: string;
  slug: string;
  full_slug?: string;
  name: string;
  tag_list?: string[];
  content?: {
    title?: string;
    date?: string;
    external_only?: boolean;
    link?: { url?: string; cached_url?: string };
    images?: Array<{ filename?: string; content_type?: string }>;
  };
}

const IS_DEV = process.env.NODE_ENV === "development";
const PERSONAL_TAG = "Personal";
const CLIENT_TAG = "Client";

function isDirectWorkSlug(slug: string): boolean {
  return slug.startsWith(STORYBLOK_SLUGS.WORK_PREFIX) && slug.split("/").length === 2;
}

function toWorkItem(story: WorkStory, publishedUuids: Set<string>): WorkItem {
  const externalOnly = story.content?.external_only === true;
  const externalUrl = story.content?.link?.url || story.content?.link?.cached_url;
  const rawImageUrl = firstImageFilename(story.content?.images);
  return {
    id: story.uuid,
    slug: externalOnly && externalUrl ? externalUrl : story.slug,
    title: story.content?.title || story.name,
    imageUrl: imagePreset.thumb(rawImageUrl) || undefined,
    isDraft: !publishedUuids.has(story.uuid),
    isExternal: externalOnly,
    date: story.content?.date,
  };
}

/** Dedupes the per-request Storyblok call across `generateMetadata` + page. */
export const getCachedStory = cache(async (fullSlug: string, opts: { draftMode: boolean }) => {
  return fetchStory(fullSlug, {
    draftMode: opts.draftMode,
    resolveRelations: [STORYBLOK_RELATIONS.WORK_LIST],
  });
});

export async function getRecentWork(): Promise<{
  personalWork: WorkItem[];
  clientWork: WorkItem[];
}> {
  const fetchWork = async () => {
    try {
      const [draftResponse, publishedResponse] = await Promise.all([
        getStoryblokApi({ draftMode: true }).getStories({
          starts_with: STORYBLOK_SLUGS.WORK_PREFIX,
          per_page: 100,
          sort_by: "content.date:desc",
          cv: Date.now(),
        }),
        getStoryblokApi({ draftMode: false }).getStories({
          starts_with: STORYBLOK_SLUGS.WORK_PREFIX,
          per_page: 100,
          version: "published",
        }),
      ]);

      const publishedUuids = new Set<string>(
        (publishedResponse.stories ?? [])
          .filter((s: WorkStory & { first_published_at?: string | null }) =>
            Boolean(s.first_published_at),
          )
          .map((s: WorkStory) => s.uuid),
      );

      const workStories = ((draftResponse.stories ?? []) as WorkStory[]).filter((s) =>
        isDirectWorkSlug(s.full_slug || s.slug),
      );

      const visible = IS_DEV ? workStories : workStories.filter((s) => publishedUuids.has(s.uuid));

      const isPersonal = (story: WorkStory) => {
        const tags = story.tag_list ?? [];
        return tags.length === 0 || tags.includes(PERSONAL_TAG);
      };
      const isClient = (story: WorkStory) => (story.tag_list ?? []).includes(CLIENT_TAG);

      const take = (predicate: (s: WorkStory) => boolean): WorkItem[] =>
        visible.filter(predicate).map((s) => toWorkItem(s, publishedUuids));

      return {
        personalWork: take(isPersonal),
        clientWork: take(isClient),
      };
    } catch (error) {
      console.error("Error fetching work items:", error);
      return { personalWork: [], clientWork: [] };
    }
  };

  if (IS_DEV) {
    return fetchWork();
  }
  return unstable_cache(fetchWork, ["recent-work"], {
    tags: [CACHE_TAGS.STORIES],
    revalidate: 3600,
  })();
}

export async function getAdjacentWork(
  currentSlug: string,
): Promise<{ prev?: AdjacentWork; next?: AdjacentWork }> {
  return unstable_cache(
    async () => {
      try {
        const res = await getStoryblokApi({ draftMode: false }).getStories({
          starts_with: STORYBLOK_SLUGS.WORK_PREFIX,
          per_page: 100,
          sort_by: "content.date:desc",
          version: "published",
        });
        const stories = (res.stories ?? []) as WorkStory[];
        const direct = stories.filter((s) => {
          const full = s.full_slug || s.slug;
          const rest = full.replace(/^work\//, "");
          return rest && !rest.includes("/");
        });
        const idx = direct.findIndex((s) => s.slug === currentSlug);
        if (idx === -1) {
          return {};
        }
        const toAdjacent = (s: WorkStory | undefined): AdjacentWork | undefined =>
          s ? { slug: s.slug, title: s.content?.title || s.name || s.slug } : undefined;
        return {
          prev: toAdjacent(direct[idx - 1]),
          next: toAdjacent(direct[idx + 1]),
        };
      } catch {
        return {};
      }
    },
    ["adjacent-work", currentSlug],
    { revalidate: 3600 },
  )();
}
