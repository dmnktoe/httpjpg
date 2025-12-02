"use client";

import { Headline } from "@httpjpg/ui";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapColorToToken } from "../../lib/token-mapping";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";

export interface SbHeadlineProps {
  blok: {
    _uid: string;
    text: string;
    level?: 1 | 2 | 3;
    align?: "left" | "center" | "right";
    color?: string;
    marginTop?: string;
    marginBottom?: string;
    paddingTop?: string;
    paddingBottom?: string;
  };
}

/**
 * Storyblok Headline Component
 * Semantic heading component with configurable styling
 */
export const SbHeadline = memo(function SbHeadline({ blok }: SbHeadlineProps) {
  const {
    text,
    level = 2,
    align,
    color,
    marginTop,
    marginBottom,
    paddingTop,
    paddingBottom,
  } = blok;

  const mappedColor = mapColorToToken(color);
  const editableProps = useStoryblokEditable(blok);

  return (
    <Headline
      {...editableProps}
      level={level}
      style={{
        color: mappedColor || "black",
      }}
      css={{
        textAlign: align,
        mt: mapSpacingToToken(marginTop),
        mb: mapSpacingToToken(marginBottom),
        pt: mapSpacingToToken(paddingTop),
        pb: mapSpacingToToken(paddingBottom),
      }}
    >
      {text}
    </Headline>
  );
});
