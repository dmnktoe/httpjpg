"use client";

import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import { Box } from "@httpjpg/ui";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapProseMaxWidthToToken } from "../../lib/token-mapping";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";

export interface SbRichTextProps {
  blok: {
    _uid: string;
    content: any;
    maxWidth?: string;
    marginTop?: string;
    marginBottom?: string;
    paddingTop?: string;
    paddingBottom?: string;
  };
}

/**
 * Storyblok Rich Text Component
 * Renders rich text with automatic Headline, Paragraph, Link, etc. components
 */
export const SbRichText = memo(function SbRichText({ blok }: SbRichTextProps) {
  const {
    content,
    maxWidth,
    marginTop,
    marginBottom,
    paddingTop,
    paddingBottom,
  } = blok;

  const mappedMaxWidth = mapProseMaxWidthToToken(maxWidth);
  const editableProps = useStoryblokEditable(blok);

  if (!content) {
    return null;
  }

  return (
    <Box
      {...editableProps}
      css={{
        mt: mapSpacingToToken(marginTop),
        mb: mapSpacingToToken(marginBottom),
        pt: mapSpacingToToken(paddingTop),
        pb: mapSpacingToToken(paddingBottom),
      }}
    >
      <StoryblokRichText data={content} maxWidth={mappedMaxWidth} />
    </Box>
  );
});
