"use client";

import type { SbHoloImageData } from "@httpjpg/storyblok-utils";
import { getResponsiveImage } from "@httpjpg/storyblok-utils";
import { Box, HoloCard } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, sizesFromWidths, spacingCss, widthCss } from "../../lib/use-blok";
import { SbCaption, type SbCaptionProps } from "../caption/SbCaption";

export interface SbHoloImageProps {
  blok: SbHoloImageData;
}

export const SbHoloImage = memo(function SbHoloImage({ blok }: SbHoloImageProps) {
  const {
    image,
    alt,
    caption,
    variant = "card",
    aspectRatio = "5/7",
    width = "50%",
    widthMd,
    widthLg,
    isLoadingEager,
    fetchPriority,
    intensity,
    maxTilt,
    idle = true,
    gyro = true,
  } = blok;
  const editable = editableAttrs(blok);

  if (!image?.filename) {
    return null;
  }

  const isDisc = variant === "disc";
  const { src, srcSet } = getResponsiveImage(image.filename, {
    aspectRatio: isDisc ? "1/1" : aspectRatio,
    focus: image.focus || "",
  });
  const sizes = sizesFromWidths({ width, widthMd, widthLg });

  return (
    <Box
      {...editable}
      css={{
        mb: "4",
        ...widthCss({ width, widthMd, widthLg }),
        ...spacingCss(blok),
      }}
    >
      <HoloCard
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || image.alt || image.title || ""}
        variant={variant}
        aspectRatio={aspectRatio}
        intensity={clampIntensity(intensity)}
        maxTilt={maxTilt && maxTilt > 0 ? maxTilt : undefined}
        idle={idle}
        gyro={gyro}
        loading={isLoadingEager ? "eager" : "lazy"}
        fetchPriority={fetchPriority}
        copyright={image.copyright || ""}
        copyrightSource={image.source || ""}
      >
        {!!caption?.content?.length && <SbCaption data={caption as SbCaptionProps["data"]} />}
      </HoloCard>
    </Box>
  );
});

SbHoloImage.displayName = "SbHoloImage";

function clampIntensity(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }
  return Math.min(Math.max(value, 0), 1);
}
