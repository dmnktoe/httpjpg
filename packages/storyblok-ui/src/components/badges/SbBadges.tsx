import type { SbBadgesData } from "@httpjpg/storyblok-utils";
import { Badges, Box } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbBadgesProps {
  blok: SbBadgesData;
}

export const SbBadges = memo(function SbBadges({ blok }: SbBadgesProps) {
  const { items, align, justify, height } = blok;

  if (!items?.length) {
    return null;
  }

  const badgeItems = items.map((item) => ({
    src: item.src,
    alt: item.alt,
    href: item.href || undefined,
    title: item.title || undefined,
  }));

  return (
    <Box {...editableAttrs(blok)} css={spacingCss(blok)}>
      <Badges items={badgeItems} align={align} justify={justify} height={height || undefined} />
    </Box>
  );
});

SbBadges.displayName = "SbBadges";
