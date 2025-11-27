import { Headline } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapColorToToken } from "../../lib/token-mapping";

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

  return (
    <Headline
      {...storyblokEditable(blok)}
      level={level}
      css={{
        textAlign: align,
        color: mapColorToToken(color),
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
