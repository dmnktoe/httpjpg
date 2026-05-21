import { Headline } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbHeadlineProps {
  blok: BlokSpacing & {
    _uid: string;
    text: string;
    level?: 1 | 2 | 3;
    align?: "left" | "center" | "right" | "justify";
    color?: string;
  };
}

export const SbHeadline = memo(function SbHeadline({ blok }: SbHeadlineProps) {
  const { text, level = 2, align, color } = blok;
  const editable = editableAttrs(blok);

  return (
    <Headline {...editable} level={level} align={align} css={{ color, ...spacingCss(blok) }}>
      {text}
    </Headline>
  );
});

SbHeadline.displayName = "SbHeadline";
