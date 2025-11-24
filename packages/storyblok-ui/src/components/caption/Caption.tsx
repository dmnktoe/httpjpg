/**
 * Caption component for images and videos
 * Provides consistent styling for media captions
 */

import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import { Box } from "@httpjpg/ui";
import { memo } from "react";

export interface CaptionProps {
  data: StoryblokRichTextProps["data"];
}

/**
 * Caption component
 * Displays rich text caption with consistent styling
 */
export const Caption = memo(function Caption({ data }: CaptionProps) {
  return (
    <Box
      css={{
        mt: "2",
        fontSize: "sm",
        color: "neutral.600",
        lineHeight: "1.5",
      }}
    >
      <StoryblokRichText data={data} />
    </Box>
  );
});
