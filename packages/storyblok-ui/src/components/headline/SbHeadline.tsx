import type { SbHeadlineData } from "@httpjpg/storyblok-utils";
import { Headline } from "@httpjpg/ui";
import { memo } from "react";

import { BlokMotion } from "../../lib/blok-motion";
import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbHeadlineProps {
  blok: SbHeadlineData;
}

export const SbHeadline = memo(function SbHeadline({ blok }: SbHeadlineProps) {
  const { text, level = "2", align, color, animation, animationDelay } = blok;
  const editable = editableAttrs(blok);

  return (
    <BlokMotion animation={animation} delay={animationDelay}>
      <Headline
        {...editable}
        level={Number(level) as 1 | 2 | 3}
        align={align}
        css={{ color, ...spacingCss(blok) }}
      >
        {text}
      </Headline>
    </BlokMotion>
  );
});

SbHeadline.displayName = "SbHeadline";
