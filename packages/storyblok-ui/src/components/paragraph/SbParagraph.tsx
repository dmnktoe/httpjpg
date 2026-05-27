import type { SbParagraphData } from "@httpjpg/storyblok-utils";
import { Paragraph } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbParagraphProps {
  blok: SbParagraphData;
}

export const SbParagraph = memo(function SbParagraph({ blok }: SbParagraphProps) {
  const { text, size, weight, align, color } = blok;
  const editable = editableAttrs(blok);

  return (
    <Paragraph
      {...editable}
      size={size as Exclude<typeof size, "base">}
      align={align}
      css={{
        color,
        fontWeight: weight,
        ...spacingCss(blok),
      }}
    >
      {text}
    </Paragraph>
  );
});

SbParagraph.displayName = "SbParagraph";
