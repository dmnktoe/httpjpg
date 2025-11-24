"use client";

import { DynamicRender } from "@httpjpg/storyblok-utils";
import type { ISbStoryData } from "@storyblok/react";
import { useStoryblokBridge } from "@storyblok/react/rsc";
import { useState } from "react";

interface StoryblokLivePreviewProps {
  story: ISbStoryData;
  resolveRelations?: string[];
}

/**
 * Client Component for Storyblok Live Preview
 * Wraps story content and enables live editing in Visual Editor
 *
 * Common resolve_relations patterns:
 * - "menu_link.link" - Navigation menu items that reference stories
 * - "featured_articles.articles" - Article references
 * - "global_reference.reference" - Global component references
 */
export function StoryblokLivePreview({
  story: initialStory,
  resolveRelations = ["menu_link.link", "global_reference.reference"],
}: StoryblokLivePreviewProps) {
  const [story, setStory] = useState(initialStory);

  // useStoryblokBridge handles live updates from Visual Editor
  // Initialize bridge only on client-side (hook checks for window internally)
  useStoryblokBridge(story.id, (newStory) => setStory(newStory), {
    resolveRelations,
  });

  if (!story?.content) {
    return null;
  }

  return <DynamicRender data={story.content} />;
}
