import type { SbHeadlineData } from "@httpjpg/storyblok-utils";
import { Headline } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbHeadlineProps {
  blok: SbHeadlineData;
}

export const SbHeadline = memo(function SbHeadline({ blok }: SbHeadlineProps) {
  const { text, level = "2", align, color } = blok;
  const editable = editableAttrs(blok);

  return (
    <Headline
      {...editable}
      level={Number(level) as 1 | 2 | 3}
      align={align}
      css={{ color, ...spacingCss(blok) }}
    >
      {text}
    </Headline>
  );
});

SbHeadline.displayName = "SbHeadline";
