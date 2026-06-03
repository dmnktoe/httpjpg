import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import type { SbRichtextData } from "@httpjpg/storyblok-utils";
import { Box } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbRichTextProps {
  blok: SbRichtextData;
}

function parseMaxWidth(value?: string): string | boolean {
  if (value === "none") {
    return false;
  }
  if (!value) {
    return true;
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

SbRichText.displayName = "SbRichText";
