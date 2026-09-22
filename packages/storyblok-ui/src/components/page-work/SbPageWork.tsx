import { type SbWorkData, type StoryblokLink } from "@httpjpg/storyblok-utils";
import { Box, DesktopDownloads, type DesktopDownloadItem, FloatingPreviewBadge } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

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

function workDownloadItems(blok: SbWorkData): DesktopDownloadItem[] {
  return (blok.downloads ?? []).flatMap((item) => {
    const name = item.name?.trim() ?? "";
    const url = item.url?.trim() ?? "";
    if (!name || !url) {
      return [];
    }
    return [{ id: item._uid, name, url }];
  });
}

export const SbPageWork = memo(function SbPageWork({ blok }: SbPageWorkProps) {
  const { body, external_only, link, accentColor } = blok;
  const previewHref = isExternalPreviewLink(link) ? storyblokHref(link) : null;
  const downloads = workDownloadItems(blok);
  return (
    <Box {...editableAttrs(blok)}>
      {!external_only &&
        body?.map((child) => <StoryblokServerComponent key={child._uid} blok={child} />)}
      {previewHref && <FloatingPreviewBadge href={previewHref} accentColor={accentColor} />}
      {downloads.length > 0 && <DesktopDownloads items={downloads} />}
    </Box>
  );
});

SbPageWork.displayName = "SbPageWork";
