import type { StoryblokLink } from "@httpjpg/storyblok-utils";
import { Box, Button, Callout, type CalloutProps } from "@httpjpg/ui";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbCalloutProps {
  blok: BlokSpacing & {
    _uid: string;
    title?: string;
    body: string;
    tone?: CalloutProps["tone"];
    align?: CalloutProps["align"];
    ctaText?: string;
    ctaLink?: StoryblokLink;
    ctaVariant?: "primary" | "secondary" | "outline";
  };
}

export const SbCallout = memo(function SbCallout({ blok }: SbCalloutProps) {
  const { title, body, tone, align, ctaText, ctaLink, ctaVariant = "primary" } = blok;
  const href = ctaText && ctaLink ? storyblokHref(ctaLink) : "";

  return (
    <Box {...editableAttrs(blok)} css={spacingCss(blok)}>
      <Callout
        tone={tone}
        align={align}
        title={title || undefined}
        action={
          ctaText && href ? (
            <Button variant={ctaVariant} href={href}>
              {ctaText}
            </Button>
          ) : undefined
        }
      >
        {body}
      </Callout>
    </Box>
  );
});

SbCallout.displayName = "SbCallout";
