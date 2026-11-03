"use client";

import type { SbHoloImageData } from "@httpjpg/storyblok-utils";
import { getResponsiveImage } from "@httpjpg/storyblok-utils";
import { Box, HoloCard } from "@httpjpg/ui";
import { memo } from "react";

import { sameOriginImageUrl } from "../../lib/same-origin-image";
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
    depth,
    foreground,
    effects,
    depthMap,
    foil = "silver",
    sparkle = "stars",
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
  // Textures go through Next's optimizer: the CDN sends no CORS headers and a
  // tainted image cannot be uploaded to WebGL. The <img> keeps the CDN URLs.
  const textureSrc = sameOriginImageUrl(src, TEXTURE_WIDTH);
  const cropLikePhoto = (filename: string) =>
    getResponsiveImage(filename, {
      aspectRatio: isDisc ? "1/1" : aspectRatio,
      focus: image.focus || "",
    }).src;
  // Effects cover the overhang frame, so they are never cropped; the depth map
  // shares the photo's crop so the two line up pixel for pixel.
  const effectsSrc = effects?.filename
    ? sameOriginImageUrl(effects.filename, TEXTURE_WIDTH)
    : undefined;
  const depthSrc = depthMap?.filename
    ? sameOriginImageUrl(cropLikePhoto(depthMap.filename), TEXTURE_WIDTH)
    : undefined;
  // Same crop as the photo so the cut-out lines up at rest.
  const foregroundSrc = foreground?.filename
    ? sameOriginImageUrl(cropLikePhoto(foreground.filename), TEXTURE_WIDTH)
    : undefined;

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
        textureSrc={textureSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || image.alt || image.title || ""}
        variant={variant}
        aspectRatio={aspectRatio}
        intensity={clampIntensity(intensity)}
        maxTilt={maxTilt && maxTilt > 0 ? maxTilt : undefined}
        idle={idle}
        gyro={gyro}
        depth={depth !== undefined && Number.isFinite(depth) ? Math.max(0, depth) : undefined}
        foregroundSrc={foregroundSrc}
        effectsSrc={effectsSrc}
        depthSrc={depthSrc}
        foil={foil}
        sparkle={sparkle}
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

/** Enough for a card at 2× on a phone; the optimizer snaps it to a device size. */
const TEXTURE_WIDTH = 1200;

function clampIntensity(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }
  return Math.min(Math.max(value, 0), 1);
}
