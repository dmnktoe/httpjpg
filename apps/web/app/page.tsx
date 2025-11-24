import { CACHE_TAGS, getStoryblokApi } from "@httpjpg/storyblok-api";
import { DynamicRender } from "@httpjpg/storyblok-utils";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

/**
 * Homepage - loads content from Storyblok
 * Slug: "home" (or configure your main story slug)
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const search = await searchParams;
  const { isEnabled } = await draftMode();

  // Check if we're in Visual Editor mode (has _storyblok param or _draft param)
  const isVisualEditor = search._storyblok || search._draft;
  const isDraft = isEnabled || isVisualEditor;

  // Draft mode: Fresh fetch with preview token
  // Production: Cached fetch with ISR
  const story = isDraft
    ? await getStoryblokApi({ draftMode: true }).getStory({ slug: "home" })
    : await unstable_cache(
        async () => {
          const { getStory } = getStoryblokApi();
          return await getStory({ slug: "home" });
        },
        ["story-home"],
        {
          tags: [CACHE_TAGS.STORY("home"), CACHE_TAGS.STORIES],
          revalidate: 3600,
        },
      )();

  if (!story) {
    return notFound();
  }

  // Use live preview for draft mode (enables live editing in Visual Editor)
  if (isDraft) {
    const { StoryblokLivePreviewWrapper } = await import(
      "../components/storyblok-live-preview-wrapper"
    );
    return <StoryblokLivePreviewWrapper story={story} />;
  }

  // Static render for production with error boundary
  const { StoryblokErrorBoundary } = await import(
    "../components/storyblok-error-boundary"
  );
  return (
    <StoryblokErrorBoundary>
      <DynamicRender data={story.content} />
    </StoryblokErrorBoundary>
  );
}

// Enable ISR with revalidation
export const revalidate = 3600;
