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

export function StoryblokLive({ story: initialStory }: { story: ISbStoryData }) {
  const hasMounted = useHasMounted();
  const story = useStoryblokState(initialStory);

  if (!story?.content) {
    return null;
  }

  const theme = (story.content as { isDark?: boolean })?.isDark ? "dark" : "light";

  return (
    <>
      <ThemeSync theme={theme} />
      {hasMounted ? <StoryblokComponent blok={story.content} /> : null}
    </>
  );
}
