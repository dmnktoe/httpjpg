import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import { Box } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbRichTextProps {
  blok: BlokSpacing & {
    _uid: string;
    content: unknown;
    maxWidth?: string;
    color?: string;
  };
}

function parseMaxWidth(value?: string): string | boolean | undefined {
  if (!value || value === "none") {
    return value === "none" ? false : undefined;
  }
  return value;
}

export const SbRichText = memo(function SbRichText({ blok }: SbRichTextProps) {
  const { content, maxWidth, color } = blok;
  const editable = editableAttrs(blok);

  if (!content) {
    return null;
  }

  return (
    <Box {...editable} css={spacingCss(blok)}>
      <StoryblokRichText
        data={content as never}
        maxWidth={parseMaxWidth(maxWidth)}
        color={color || undefined}
      />
    </Box>
  );
});
