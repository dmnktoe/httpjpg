"use client";

import { type ISbStoryData, useStoryblokState } from "@storyblok/react";
import { StoryblokServerComponent } from "@storyblok/react/rsc";

import { ThemeSync } from "@/components/ui/theme-sync";

export function StoryblokLive({ story: initialStory }: { story: ISbStoryData }) {
  const story = useStoryblokState(initialStory);
  if (!story?.content) {
    return null;
  }
  const theme = (story.content as { isDark?: boolean })?.isDark ? "dark" : "light";
  return (
    <>
      <ThemeSync theme={theme} />
      <StoryblokServerComponent blok={story.content} />
    </>
  );
}
