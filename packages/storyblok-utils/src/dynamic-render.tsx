"use client";

import { StoryblokComponent } from "@storyblok/react/rsc";
import type { BlokItem } from "./types";

export interface DynamicRenderProps {
  data?: BlokItem | BlokItem[];
  asList?: boolean;
}

/**
 * Dynamically render Storyblok components
 */
export function DynamicRender({ data, asList = false }: DynamicRenderProps) {
  if (!data) {
    return null;
  }

  // Render array of blocks
  if (Array.isArray(data)) {
    if (asList) {
      return (
        <>
          {data.map((blok) => (
            <li key={blok._uid}>
              <StoryblokComponent blok={blok} />
            </li>
          ))}
        </>
      );
    }

    return (
      <>
        {data.map((blok) => (
          <StoryblokComponent key={blok._uid} blok={blok} />
        ))}
      </>
    );
  }

  // Render single block
  return <StoryblokComponent blok={data} />;
}
