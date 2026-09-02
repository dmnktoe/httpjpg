import type { SbPageData } from "@httpjpg/storyblok-utils";
import { Box, FloatingPreviewBadge } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { draftEditorChrome } from "../../lib/editor-chrome";
import { editableAttrs } from "../../lib/use-blok";

export interface SbPageProps {
  blok: SbPageData;
}

export const SbPage = memo(function SbPage({ blok }: SbPageProps) {
  const { body, isDark } = blok;
  const chrome = draftEditorChrome(blok._editable);
  return (
    <Box
      {...editableAttrs(blok)}
      css={{ color: isDark ? "white" : "black", backgroundColor: isDark ? "black" : "white" }}
    >
      {body?.map((child) => (
        <StoryblokServerComponent key={child._uid} blok={child} />
      ))}
      {chrome.editHref ? (
        <FloatingPreviewBadge gridToggle={chrome.gridToggle} actions={chrome.actions} />
      ) : null}
    </Box>
  );
});

SbPage.displayName = "SbPage";
