"use client";

import type { ISbStoryData } from "@storyblok/react";
import dynamic from "next/dynamic";

// Dynamic import with SSR disabled (StoryblokLivePreview uses window)
const StoryblokLivePreview = dynamic(
  () =>
    import("./storyblok-live-preview").then((mod) => mod.StoryblokLivePreview),
  { ssr: false },
);

const StoryblokErrorBoundary = dynamic(
  () =>
    import("./storyblok-error-boundary").then(
      (mod) => mod.StoryblokErrorBoundary,
    ),
  { ssr: false },
);

interface StoryblokLivePreviewWrapperProps {
  story: ISbStoryData;
}

/**
 * Client Component Wrapper for Storyblok Live Preview
 * Handles dynamic import with SSR disabled
 */
export function StoryblokLivePreviewWrapper({
  story,
}: StoryblokLivePreviewWrapperProps) {
  return (
    <StoryblokErrorBoundary>
      <StoryblokLivePreview story={story} />
    </StoryblokErrorBoundary>
  );
}
