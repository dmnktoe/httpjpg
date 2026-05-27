import type { SbPageData } from "@httpjpg/storyblok-utils";
import { Box } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { editableAttrs } from "../../lib/use-blok";

export interface SbPageProps {
  blok: SbPageData;
}

export const SbPage = memo(function SbPage({ blok }: SbPageProps) {
  const { body, isDark } = blok;
  return (
    <Box
      {...editableAttrs(blok)}
      css={{
        backgroundColor: isDark ? "black" : "white",
        color: isDark ? "white" : "black",
      }}
    >
      {body?.map((child) => (
        <StoryblokServerComponent key={child._uid} blok={child} />
      ))}
    </Box>
  );
});

SbPage.displayName = "SbPage";
