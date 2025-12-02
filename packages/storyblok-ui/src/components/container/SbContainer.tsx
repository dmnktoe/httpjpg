import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { Container } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapColorToToken } from "../../lib/token-mapping";

export interface SbContainerProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    width?: "sm" | "md" | "lg" | "xl" | "2xl" | "fluid";
    px?: string;
    py?: string;
    pt?: string;
    pb?: string;
    mt?: string;
    mb?: string;
    my?: string;
    bgColor?: string;
    // Responsive overrides (optional)
    pxMd?: string;
    pyMd?: string;
    pxLg?: string;
    pyLg?: string;
  };
}

/**
 * Storyblok Container Component
 * Wrapper around base Container with spacing and background options
 */
export const SbContainer = memo(function SbContainer({
  blok,
}: SbContainerProps) {
  const {
    body,
    width = "lg",
    px,
    py,
    pt,
    pb,
    mt,
    mb,
    my,
    bgColor,
    pxMd,
    pyMd,
    pxLg,
    pyLg,
  } = blok;

  if (!body || !Array.isArray(body)) {
    return null;
  }

  // Build responsive spacing objects
  const pxValue = mapSpacingToToken(px);
  const pyValue = mapSpacingToToken(py);

  const responsivePx =
    pxMd || pxLg
      ? {
          base: pxValue,
          md: mapSpacingToToken(pxMd) || pxValue,
          lg: mapSpacingToToken(pxLg) || mapSpacingToToken(pxMd) || pxValue,
        }
      : pxValue;

  const responsivePy =
    pyMd || pyLg
      ? {
          base: pyValue,
          md: mapSpacingToToken(pyMd) || pyValue,
          lg: mapSpacingToToken(pyLg) || mapSpacingToToken(pyMd) || pyValue,
        }
      : pyValue;

  return (
    <Container
      {...storyblokEditable(blok)}
      size={width}
      px={responsivePx}
      py={responsivePy}
      css={{
        pt: mapSpacingToToken(pt),
        pb: mapSpacingToToken(pb),
        mt: mapSpacingToToken(mt),
        mb: mapSpacingToToken(mb),
        my: mapSpacingToToken(my),
        bg: mapColorToToken(bgColor),
      }}
    >
      <DynamicRender data={body as BlokItem[]} />
    </Container>
  );
});
