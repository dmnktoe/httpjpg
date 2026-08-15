"use client";

import { type ISbStoryData, useStoryblokState } from "@storyblok/react";
import { StoryblokServerComponent } from "@storyblok/react/rsc";

import { ThemeSync } from "@/components/ui/theme-sync";
import { VeilTintSync } from "@/components/ui/veil-tint-sync";

export function StoryblokLive({ story: initialStory }: { story: ISbStoryData }) {
  const story = useStoryblokState(initialStory);
  if (!story?.content) {
    return null;
  }
  const content = story.content as {
    isDark?: boolean;
    component?: string;
    accentColor?: string;
  };
  const theme = content.isDark ? "dark" : "light";
  const veilColor = content.component === "work" ? content.accentColor : null;
  return (
    <>
      <ThemeSync theme={theme} />
      <VeilTintSync color={veilColor} />
      <StoryblokServerComponent blok={story.content} />
    </>
  );
}
