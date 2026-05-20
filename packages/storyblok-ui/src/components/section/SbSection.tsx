import { Section, type SectionProps } from "@httpjpg/ui";
import { type SbBlokData, StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbSectionProps {
  blok: BlokSpacing & {
    _uid: string;
    content?: SbBlokData[];
    bgColor?: string;
    useContainer?: boolean;
    containerSize?: SectionProps["containerSize"];
    containerAlign?: SectionProps["containerAlign"];
  };
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
