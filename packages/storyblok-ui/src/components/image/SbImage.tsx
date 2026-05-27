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

  const { ref: parallaxRef, offset } = useParallax<HTMLDivElement>({
    speed: parallax,
    disabled: parallax === 0,
  });

  if (!image?.filename) {
    return null;
  }

  const { src, srcSet } = getResponsiveImage(image.filename, {
    aspectRatio,
    focus: image.focus || "",
  });
  const sizes = sizesFromWidths({ width, widthMd, widthLg });
  const blurDataURL = blurOnLoad ? imagePreset.blur(image.filename, image.focus) : undefined;

  return (
    <Box
      {...editable}
      css={{
        mb: "4",
        ...widthCss({ width, widthMd, widthLg }),
        ...spacingCss(blok),
      }}
    >
      <Box
        ref={parallaxRef}
        css={{ position: "relative" }}
        style={parallax > 0 ? { transform: `translate3d(0, ${offset}px, 0)` } : undefined}
      >
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
        {overlay !== "none" && (
          <ImageOverlay pattern={overlay} seed={image.filename} color="currentColor" />
        )}
      </Box>
      {caption && <SbCaption data={caption as SbCaptionProps["data"]} />}
    </Box>
  );
});

SbImage.displayName = "SbImage";
