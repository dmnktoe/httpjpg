import type { SbSectionData } from "@httpjpg/storyblok-utils";
import { Section } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { EntranceMotion } from "../../lib/entrance-motion";
import { editableAttrs, spacingStyle } from "../../lib/use-blok";

export interface SbSectionProps {
  blok: SbSectionData;
}

export const SbSection = memo(function SbSection({ blok }: SbSectionProps) {
  const { content, bgColor, useContainer, containerSize, containerAlign } = blok;
  // Section pads 16 top and bottom by default; restate it so a tablet-only value doesn't drop it on mobile.
  const spacing = spacingStyle(blok, { pt: "16", pb: "16" });
  if (!content?.length) {
    return null;
  }
  return (
    <EntranceMotion blok={blok}>
      <Section
        {...editableAttrs(blok)}
        useContainer={useContainer}
        containerSize={containerSize}
        containerAlign={containerAlign}
        css={{ backgroundColor: bgColor, ...spacing.css }}
        style={spacing.style}
      >
        {content.map((child) => (
          <StoryblokServerComponent key={child._uid} blok={child} />
        ))}
      </Section>
    </EntranceMotion>
  );
});

SbSection.displayName = "SbSection";
