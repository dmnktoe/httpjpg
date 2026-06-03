import type { SbCalloutData } from "@httpjpg/storyblok-utils";
import { Box, Button, Callout } from "@httpjpg/ui";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbCalloutProps {
  blok: SbCalloutData;
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
