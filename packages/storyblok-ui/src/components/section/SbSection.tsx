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
  const spacing = spacingStyle(blok);
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
