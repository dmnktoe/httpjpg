"use client";

import { type PageScaleSource, parsePageScale, useHasMounted } from "@httpjpg/ui";
import { StoryblokComponent, type ISbStoryData, useStoryblokState } from "@storyblok/react";

import { ThemeSync } from "@/components/ui/theme-sync";

export interface StoryblokLiveProps {
  story: ISbStoryData;
}

export function StoryblokLive({ story: initialStory }: StoryblokLiveProps) {
  const hasMounted = useHasMounted();
  const story = useStoryblokState(initialStory);

  if (!story?.content) {
    return null;
  }

  const content = story.content as PageScaleSource & {
    isDark?: boolean;
    component?: string;
    accentColor?: string;
  };
  const theme = content.isDark ? "dark" : "light";
  const isWork = content.component === "work";
  const accent = isWork ? content.accentColor : null;
  const scale = isWork ? parsePageScale(content) : null;

  return (
    <>
      <ThemeSync theme={theme} accent={accent} scale={scale} />
      {hasMounted ? <StoryblokComponent blok={story.content} /> : null}
    </>
  );
}
