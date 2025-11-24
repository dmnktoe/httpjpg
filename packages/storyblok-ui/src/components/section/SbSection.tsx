import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { Section } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";

export interface SbSectionProps {
  blok: {
    _uid: string;
    content?: SbBlokData[];
    bgColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
    marginTop?: string;
    marginBottom?: string;
    width?: "container" | "full";
  };
}

/**
 * Storyblok Section Component
 * Semantic section wrapper with spacing and background options
 */
export const SbSection = memo(function SbSection({ blok }: SbSectionProps) {
  const {
    content,
    bgColor,
    paddingTop,
    paddingBottom,
    marginTop,
    marginBottom,
    width = "container",
  } = blok;

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <Section
      {...storyblokEditable(blok)}
      useContainer={width === "container"}
      css={{
        bg: bgColor || undefined,
        pt: paddingTop || undefined,
        pb: paddingBottom || undefined,
        mt: marginTop || undefined,
        mb: marginBottom || undefined,
      }}
    >
      <DynamicRender data={content as BlokItem[]} />
    </Section>
  );
});
