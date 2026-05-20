import { Container, type ContainerProps } from "@httpjpg/ui";
import { type SbBlokData, StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbContainerProps {
  blok: BlokSpacing & {
    _uid: string;
    body?: SbBlokData[];
    width?: ContainerProps["size"];
    center?: boolean;
    bgColor?: string;
  };
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
