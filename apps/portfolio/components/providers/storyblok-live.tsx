"use client";

import { firstImageFilename, imagePreset } from "@httpjpg/storyblok-utils";
import { type ISbStoryData, useStoryblokState } from "@storyblok/react";
import { StoryblokServerComponent } from "@storyblok/react/rsc";

import { AccentSync } from "@/components/ui/accent-sync";
import { ThemeSync } from "@/components/ui/theme-sync";

export function StoryblokLive({ story: initialStory }: { story: ISbStoryData }) {
  const story = useStoryblokState(initialStory);
  if (!story?.content) {
    return null;
  }
  const content = story.content as {
    isDark?: boolean;
    component?: string;
    images?: Array<{ filename?: string; content_type?: string }>;
  };
  const theme = content.isDark ? "dark" : "light";
  const accentImageUrl =
    content.component === "work"
      ? imagePreset.thumb(firstImageFilename(content.images)) || undefined
      : undefined;
  return (
    <>
      <ThemeSync theme={theme} />
      <AccentSync imageUrl={accentImageUrl} />
      <StoryblokServerComponent blok={story.content} />
    </>
  );
}
