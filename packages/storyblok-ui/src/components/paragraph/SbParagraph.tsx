import { Paragraph } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbParagraphProps {
  blok: BlokSpacing & {
    _uid: string;
    text: string;
    size?: "sm" | "md" | "lg" | "xl";
    weight?: string;
    align?: "left" | "center" | "right";
    color?: string;
  };
}

export const SbParagraph = memo(function SbParagraph({ blok }: SbParagraphProps) {
  const { text, size, weight, align, color } = blok;
  const editable = editableAttrs(blok);

  return (
    <Paragraph
      {...editable}
      size={size}
      css={{
        textAlign: align,
        color,
        fontWeight: weight,
        ...spacingCss(blok),
      }}
    >
      {text}
    </Paragraph>
  );
});
