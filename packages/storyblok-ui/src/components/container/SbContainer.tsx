import type { SbContainerData } from "@httpjpg/storyblok-utils";
import { Container } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { EntranceMotion } from "../../lib/entrance-motion";
import { editableAttrs, spacingStyle } from "../../lib/use-blok";

export interface SbContainerProps {
  blok: SbContainerData;
}

export const SbContainer = memo(function SbContainer({ blok }: SbContainerProps) {
  const { body, width = "lg", center = true, bgColor } = blok;
  const spacing = spacingStyle(blok);
  if (!body?.length) {
    return null;
  }
  return (
    <EntranceMotion blok={blok}>
      <Container
        {...editableAttrs(blok)}
        size={width}
        center={center}
        css={{ backgroundColor: bgColor, ...spacing.css }}
        style={spacing.style}
      >
        {body.map((child) => (
          <StoryblokServerComponent key={child._uid} blok={child} />
        ))}
      </Container>
    </EntranceMotion>
  );
});

SbContainer.displayName = "SbContainer";
