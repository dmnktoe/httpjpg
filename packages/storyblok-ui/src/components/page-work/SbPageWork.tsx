import type { StoryblokImage, StoryblokLink } from "@httpjpg/storyblok-utils";
import { Box, FloatingPreviewBadge } from "@httpjpg/ui";
import { type SbBlokData, StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import { editableAttrs } from "../../lib/use-blok";

export interface SbPageWorkProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    title?: string;
    description?: unknown;
    images?: StoryblokImage[];
    date?: string;
    date_end?: string;
    link?: StoryblokLink;
    external_only?: boolean;
    isDark?: boolean;
  };
}

function isExternalPreviewLink(link?: StoryblokLink): link is StoryblokLink & { url: string } {
  if (!link || link.linktype !== "url") {
    return false;
  }
  const href = storyblokHref(link);
  return /^https?:\/\//i.test(href);
}

export const SbPageWork = memo(function SbPageWork({ blok }: SbPageWorkProps) {
  const { body, external_only, link } = blok;
  const previewHref = isExternalPreviewLink(link) ? storyblokHref(link) : null;
  return (
    <Box {...editableAttrs(blok)}>
      {!external_only &&
        body?.map((child) => <StoryblokServerComponent key={child._uid} blok={child} />)}
      {previewHref && <FloatingPreviewBadge href={previewHref} />}
    </Box>
  );
});

SbPageWork.displayName = "SbPageWork";
