import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CMS_TAGS } from "@httpjpg/storyblok-next";
import type { SbPostData } from "@httpjpg/storyblok-utils";
import { cacheLife, cacheTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import { STORYBLOK_SLUGS } from "../storyblok-slugs";

export const FEED_PAGE_SIZE = 12;

export interface FeedPostEntry {
  id: string;
  href: string;
  content: SbPostData;
}

export interface FeedPage {
  posts: FeedPostEntry[];
  page: number;
  hasMore: boolean;
}

interface PostStory {
  uuid: string;
  full_slug: string;
  content?: SbPostData;
}

export async function getFeedPage(page = 1): Promise<FeedPage> {
  try {
    return await readFeedPage(page);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error fetching feed posts:", error);
    captureServerException(error, { tags: { query: "feed" } });
    return { posts: [], page, hasMore: false };
  }
}

async function readFeedPage(page: number): Promise<FeedPage> {
  "use cache";
  cacheTag(CMS_TAGS.stories);

  const response = await getStoryblokApi({ draftMode: false }).getStories({
    starts_with: STORYBLOK_SLUGS.FEED_PREFIX,
    per_page: FEED_PAGE_SIZE,
    page,
    sort_by: "content.date:desc",
    version: "published",
    filter_query: { component: { in: "post" } },
  });

  const posts = ((response.stories ?? []) as PostStory[])
    .filter((story): story is PostStory & { content: SbPostData } =>
      Boolean(story.content && story.content.component === "post"),
    )
    .map((story) => ({ id: story.uuid, href: `/${story.full_slug}`, content: story.content }));

  if (posts.length) {
    cacheLife("cms");
  } else {
    cacheLife("seconds");
  }

  return { posts, page, hasMore: page * FEED_PAGE_SIZE < (response.total ?? 0) };
}
