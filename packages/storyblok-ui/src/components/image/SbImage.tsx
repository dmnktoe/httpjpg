"use client";

import type { SbImageData } from "@httpjpg/storyblok-utils";
import { getResponsiveImage, imagePreset } from "@httpjpg/storyblok-utils";
import { Box, Image, ImageOverlay, useParallax } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, sizesFromWidths, spacingCss, widthCss } from "../../lib/use-blok";
import { SbCaption, type SbCaptionProps } from "../caption/SbCaption";

export interface SbImageProps {
  blok: SbImageData;
}

export const SbImage = memo(function SbImage({ blok }: SbImageProps) {
  const {
    image,
    alt,
    caption,
    aspectRatio,
    width = "100%",
    widthMd,
    widthLg,
    isLoadingEager,
    fetchPriority,
    blurOnLoad,
    copyrightPosition = "inline-white",
    overlay = "random",
    parallax = 0,
  } = blok;
  const editable = editableAttrs(blok);

  const parallaxSpeed = Math.min(Math.max(parallax, 0), 0.4);
  const isParallax = parallaxSpeed > 0;
  const { ref: parallaxRef, offset } = useParallax<HTMLDivElement>({
    speed: parallaxSpeed,
    disabled: !isParallax,
  });
  const parallaxScale = 1 + parallaxSpeed * 2.4;

  if (!image?.filename) {
    return null;
  }

  const { src, srcSet } = getResponsiveImage(image.filename, {
    aspectRatio,
    focus: image.focus || "",
  });
  const sizes = sizesFromWidths({ width, widthMd, widthLg });
  const blurDataURL = blurOnLoad ? imagePreset.blur(image.filename, image.focus) : undefined;

  const imageEl = (
    <Image
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt || image.alt || image.title || ""}
      aspectRatio={aspectRatio}
      copyright={image.copyright || ""}
      copyrightPosition={copyrightPosition}
      blurOnLoad={blurOnLoad}
      blurDataURL={blurDataURL}
      loading={isLoadingEager ? "eager" : "lazy"}
      fetchPriority={fetchPriority}
    />
  );

  return (
    <Box
      {...editable}
      css={{
        mb: "4",
        ...widthCss({ width, widthMd, widthLg }),
        ...spacingCss(blok),
      }}
    >
      <Box css={{ position: "relative" }}>
        {isParallax ? (
          <Box css={{ overflow: "hidden" }}>
            <Box
              ref={parallaxRef}
              css={{ willChange: "transform" }}
              style={{ transform: `translate3d(0, ${offset}px, 0) scale(${parallaxScale})` }}
            >
              {imageEl}
            </Box>
          </Box>
        ) : (
          imageEl
        )}
        {overlay !== "none" && (
          <ImageOverlay pattern={overlay} seed={image.filename} color="currentColor" />
        )}
      </Box>
      {caption && <SbCaption data={caption as SbCaptionProps["data"]} />}
    </Box>
  );
});

SbImage.displayName = "SbImage";
