/**
 * SbCaption component for images and videos
 * Provides consistent styling for media captions
 */

import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import { Box } from "@httpjpg/ui";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapColorToToken, mapFontSizeToToken } from "../../lib/token-mapping";

export interface SbCaptionProps {
  data: StoryblokRichTextProps["data"];
  size?: string;
  color?: string;
  marginTop?: string;
}

/**
 * SbCaption component
 * Displays rich text caption with consistent styling
 */
export const SbCaption = memo(function SbCaption({
  data,
  size,
  color,
  marginTop,
}: SbCaptionProps) {
  return (
    <Box
      css={{
        mt: mapSpacingToToken(marginTop) || "2",
        fontSize: mapFontSizeToToken(size) || "sm",
        color: mapColorToToken(color) || "neutral.600",
        lineHeight: "1.5",
      }}
    >
      <StoryblokRichText data={data} />
    </Box>
  );
});
