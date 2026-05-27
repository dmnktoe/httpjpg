import type { SbContainerData } from "@httpjpg/storyblok-utils";
import { Container } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbContainerProps {
  blok: SbContainerData;
}

export const SbContainer = memo(function SbContainer({ blok }: SbContainerProps) {
  const { body, width = "lg", center = true, bgColor } = blok;
  if (!body?.length) {
    return null;
  }
  return (
    <Container
      {...editableAttrs(blok)}
      size={width}
      center={center}
      css={{ backgroundColor: bgColor, ...spacingCss(blok) }}
    >
      {body.map((child) => (
        <StoryblokServerComponent key={child._uid} blok={child} />
      ))}
    </Container>
  );
});

SbContainer.displayName = "SbContainer";
