import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { DynamicRender, getSlugWithAppName } from "@httpjpg/storyblok-utils";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

/**
 * Portfolio home page (loads main folder story)
 */
export default async function PortfolioHomePage() {
  const { isEnabled } = await draftMode();
  const { getStory } = getStoryblokApi({ draftMode: isEnabled });

  const homeSlug = getSlugWithAppName({ slug: "" });
  const story = await getStory({ slug: homeSlug });

  if (!story) {
    return notFound();
  }

  return <DynamicRender data={story.content} />;
}

export const revalidate = 3600;
