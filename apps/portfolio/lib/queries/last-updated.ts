import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CMS_TAGS } from "@httpjpg/storyblok-next";
import { cacheLife, cacheTag } from "next/cache";

export async function getLastUpdated(): Promise<string | undefined> {
  try {
    return await readLastPublishedAt();
  } catch (error) {
    console.error("Error fetching last-updated timestamp:", error);
    captureServerException(error, { tags: { query: "last-updated" } });
    return undefined;
  }
}

async function readLastPublishedAt(): Promise<string | undefined> {
  "use cache";
  cacheLife("cms");
  cacheTag(CMS_TAGS.stories);
  const res = await getStoryblokApi({ draftMode: false }).getStories({
    per_page: 1,
    sort_by: "published_at:desc",
    version: "published",
  });
  const story = res.stories?.[0] as { published_at?: string } | undefined;
  return story?.published_at;
}
