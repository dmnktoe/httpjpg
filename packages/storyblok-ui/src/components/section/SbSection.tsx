import type { SbSectionData } from "@httpjpg/storyblok-utils";
import { Section } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbSectionProps {
  blok: SbSectionData;
}

export const SbSection = memo(function SbSection({ blok }: SbSectionProps) {
  const { content, bgColor, useContainer, containerSize, containerAlign } = blok;
  if (!content?.length) {
    return null;
  }
  return (
    <Section
      {...editableAttrs(blok)}
      useContainer={useContainer}
      containerSize={containerSize}
      containerAlign={containerAlign}
      css={{ backgroundColor: bgColor, ...spacingCss(blok) }}
    >
      {content.map((child) => (
        <StoryblokServerComponent key={child._uid} blok={child} />
      ))}
    </Section>
  );
});

SbSection.displayName = "SbSection";
