import type { StoryblokLink } from "@httpjpg/storyblok-utils";
import { Box, NavLink, type NavLinkProps } from "@httpjpg/ui";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbNavLinkProps {
  blok: BlokSpacing & {
    _uid: string;
    text: string;
    link?: StoryblokLink;
    variant?: NavLinkProps["variant"];
    showExternalIcon?: boolean;
  };
}

export const SbNavLink = memo(function SbNavLink({ blok }: SbNavLinkProps) {
  const { text, link, variant, showExternalIcon } = blok;
  const href = storyblokHref(link);

  if (!href) {
    return null;
  }

  return (
    <Box {...editableAttrs(blok)} css={spacingCss(blok)}>
      <NavLink href={href} variant={variant} showExternalIcon={showExternalIcon}>
        {text}
      </NavLink>
    </Box>
  );
});

SbNavLink.displayName = "SbNavLink";
