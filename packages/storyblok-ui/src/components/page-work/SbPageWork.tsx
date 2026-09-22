import { type SbWorkData, type StoryblokLink } from "@httpjpg/storyblok-utils";
import { Box, PageBadge } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { editHrefFromEditable } from "../../lib/editor-chrome";
import { storyblokHref } from "../../lib/href";
import { editableAttrs } from "../../lib/use-blok";

export interface SbPageWorkProps {
  blok: SbWorkData;
}

function isExternalPreviewLink(link?: StoryblokLink): link is StoryblokLink & { url: string } {
  if (!link || link.linktype !== "url") {
    return false;
  }
  const href = storyblokHref(link);
  return /^https?:\/\//i.test(href);
}

export const SbPageWork = memo(function SbPageWork({ blok }: SbPageWorkProps) {
  const { body, external_only, link, accentColor } = blok;
  const href = isExternalPreviewLink(link) ? storyblokHref(link) : null;
  return (
    <Box {...editableAttrs(blok)}>
      {!external_only &&
        body?.map((child) => <StoryblokServerComponent key={child._uid} blok={child} />)}
      <PageBadge
        href={href}
        editHref={editHrefFromEditable(blok._editable)}
        accentColor={accentColor}
      />
    </Box>
  );
});

SbPageWork.displayName = "SbPageWork";
