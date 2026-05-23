import type { StoryblokLink } from "@httpjpg/storyblok-utils";
import { Box, Link } from "@httpjpg/ui";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbLinkProps {
  blok: BlokSpacing & {
    _uid: string;
    text: string;
    link?: StoryblokLink;
    showExternalIcon?: boolean;
    color?: string;
  };
}

export const SbLink = memo(function SbLink({ blok }: SbLinkProps) {
  const { text, link, showExternalIcon, color } = blok;
  const href = storyblokHref(link);

  if (!href) {
    return null;
  }

  return (
    <Box {...editableAttrs(blok)} css={{ color, ...spacingCss(blok) }}>
      <Link href={href} showExternalIcon={showExternalIcon}>
        {text}
      </Link>
    </Box>
  );
});

SbLink.displayName = "SbLink";
