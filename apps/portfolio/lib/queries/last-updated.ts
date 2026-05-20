import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CACHE_TAGS } from "@httpjpg/storyblok-next";
import { unstable_cache } from "next/cache";

export async function getLastUpdated(): Promise<string | undefined> {
  return unstable_cache(
    async () => {
      try {
        const res = await getStoryblokApi({ draftMode: false }).getStories({
          per_page: 1,
          sort_by: "published_at:desc",
          version: "published",
        });
        const story = res.stories?.[0] as { published_at?: string } | undefined;
        return story?.published_at;
      } catch (error) {
        console.error("Error fetching last-updated timestamp:", error);
        return undefined;
      }
    },
    ["last-updated"],
    { tags: [CACHE_TAGS.STORIES], revalidate: 3600 },
  )();
}
