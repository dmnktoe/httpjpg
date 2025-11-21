import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { DynamicRender } from "@httpjpg/storyblok-utils";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

/**
 * Homepage - loads content from Storyblok
 * Slug: "home" (or configure your main story slug)
 */
export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const { getStory } = getStoryblokApi({ draftMode: isEnabled });

  // Try to load home story
  const story = await getStory({ slug: "home" });

  if (!story) {
    return notFound();
  }

  return <DynamicRender data={story.content} />;
}

// Enable ISR with revalidation
export const revalidate = 3600;
