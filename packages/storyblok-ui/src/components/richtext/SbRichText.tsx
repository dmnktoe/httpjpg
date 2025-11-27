import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import { Box } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";

export interface SbRichTextProps {
  blok: {
    _uid: string;
    content: any;
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
  const { content, marginTop, marginBottom, paddingTop, paddingBottom } = blok;

  if (!content) {
    return null;
  }

  return (
    <Box
      {...storyblokEditable(blok)}
      css={{
        mt: mapSpacingToToken(marginTop),
        mb: mapSpacingToToken(marginBottom),
        pt: mapSpacingToToken(paddingTop),
        pb: mapSpacingToToken(paddingBottom),
      }}
    >
      <StoryblokRichText data={content} />
    </Box>
  );
});
