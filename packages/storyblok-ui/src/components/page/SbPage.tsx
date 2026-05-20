import { Box } from "@httpjpg/ui";
import { type SbBlokData, StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { editableAttrs } from "../../lib/use-blok";

export interface SbPageProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    title?: string;
    isDark?: boolean;
  };
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
