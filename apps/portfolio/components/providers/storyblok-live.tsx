"use client";

import { StoryblokComponent, type ISbStoryData, useStoryblokState } from "@storyblok/react";
import { useSyncExternalStore } from "react";

import { ThemeSync } from "@/components/ui/theme-sync";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function useHasMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export interface StoryblokLiveProps {
  story: ISbStoryData;
}

export function StoryblokLive({ story: initialStory }: StoryblokLiveProps) {
  const hasMounted = useHasMounted();
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
  const accent = content.component === "work" ? content.accentColor : null;

  return (
    <>
      <ThemeSync theme={theme} accent={accent} />
      {hasMounted ? <StoryblokComponent blok={story.content} /> : null}
    </>
  );
}
