import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CMS_TAGS, readStory } from "@httpjpg/storyblok-next";
import { firstImageFilename, imagePreset, STORYBLOK_RELATIONS } from "@httpjpg/storyblok-utils";
import { cacheLife, cacheTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";

import { STORYBLOK_SLUGS } from "../storyblok-slugs";

export interface WorkItem {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string;
  isDraft: boolean;
  isExternal: boolean;
  externalUrl?: string;
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
const PROJECTS_TAG = "Projects";
const WEBSITES_TAG = "Websites";

function isDirectWorkSlug(slug: string): boolean {
  return slug.startsWith(STORYBLOK_SLUGS.WORK_PREFIX) && slug.split("/").length === 2;
}

function toWorkItem(story: WorkStory, publishedUuids: Set<string>): WorkItem {
  const externalOnly = story.content?.external_only === true;
  const externalUrl = story.content?.link?.url || story.content?.link?.cached_url || undefined;
  const rawImageUrl = firstImageFilename(story.content?.images);
  return {
    id: story.uuid,
    slug: externalOnly && externalUrl ? externalUrl : story.slug,
    title: story.content?.title || story.name,
    imageUrl: imagePreset.thumb(rawImageUrl) || undefined,
    isDraft: !publishedUuids.has(story.uuid),
    isExternal: externalOnly,
    externalUrl,
    date: story.content?.date,
  };
}

/**
 * The story behind a page route. `react.cache` dedupes `generateMetadata` +
 * page + root layout within one request (draft reads have no cache scope to
 * share); published reads land in `readStory`'s `cms` cache.
 */
export const readPageStory = cache(
  async (fullSlug: string, opts: { draft: boolean; language?: string }) => {
    return readStory(fullSlug, {
      draft: opts.draft,
      relations: [STORYBLOK_RELATIONS.WORK_LIST],
      ...(opts.language ? { language: opts.language } : {}),
    });
  },
);

export async function getRecentWork(): Promise<{
  projectsWork: WorkItem[];
  websitesWork: WorkItem[];
}> {
  try {
    return await readRecentWork();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error fetching work items:", error);
    captureServerException(error, { tags: { query: "recent-work" } });
    return { projectsWork: [], websitesWork: [] };
  }
}

async function readRecentWork() {
  "use cache";
  // Dev lists unpublished work too, and no publish webhook reaches localhost,
  // so it only holds the list for a few seconds there.
  if (IS_DEV) {
    cacheLife("seconds");
  } else {
    cacheLife("cms");
  }
  cacheTag(CMS_TAGS.stories);
  return loadRecentWork();
}

async function loadRecentWork(): Promise<{ projectsWork: WorkItem[]; websitesWork: WorkItem[] }> {
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

  const isProjects = (story: WorkStory) => {
    const tags = story.tag_list ?? [];
    return tags.length === 0 || tags.includes(PROJECTS_TAG);
  };
  const isWebsites = (story: WorkStory) => (story.tag_list ?? []).includes(WEBSITES_TAG);

  const take = (predicate: (s: WorkStory) => boolean): WorkItem[] =>
    visible.filter(predicate).map((s) => toWorkItem(s, publishedUuids));

  return {
    projectsWork: take(isProjects),
    websitesWork: take(isWebsites),
  };
}

export async function getAdjacentWork(
  currentSlug: string,
): Promise<{ prev?: AdjacentWork; next?: AdjacentWork }> {
  try {
    return await readAdjacentWork(currentSlug);
  } catch (error) {
    captureServerException(error, { tags: { query: "adjacent-work" } });
    return {};
  }
}

async function readAdjacentWork(
  currentSlug: string,
): Promise<{ prev?: AdjacentWork; next?: AdjacentWork }> {
  "use cache";
  cacheLife("cms");
  cacheTag(CMS_TAGS.stories);
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
}
