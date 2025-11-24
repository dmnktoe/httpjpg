import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { Container } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";

export interface SbContainerProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    width?: "full" | "container" | "narrow";
    py?: string;
    pt?: string;
    pb?: string;
    mt?: string;
    mb?: string;
    my?: string;
    bgColor?: string;
  };
}

/**
 * Storyblok Container Component
 * Wrapper around base Container with spacing and background options
 */
export const SbContainer = memo(function SbContainer({
  blok,
}: SbContainerProps) {
  const { body, width = "container", py, pt, pb, mt, mb, my, bgColor } = blok;

  if (!body || !Array.isArray(body)) {
    return null;
  }

  return (
    <Container
      {...storyblokEditable(blok)}
      css={{
        width:
          width === "narrow"
            ? "container.sm"
            : width === "container"
              ? "container"
              : "full",
        py: py || undefined,
        pt: pt || undefined,
        pb: pb || undefined,
        mt: mt || undefined,
        mb: mb || undefined,
        my: my || undefined,
        bg: bgColor || undefined,
      }}
    >
      <DynamicRender data={body as BlokItem[]} />
    </Container>
  );
});
