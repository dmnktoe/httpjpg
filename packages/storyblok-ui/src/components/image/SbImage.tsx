"use client";

import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import {
  type CmsImageWidth,
  getResponsiveImage,
  imagePreset,
  type StoryblokImage,
} from "@httpjpg/storyblok-utils";
import { Box, Image, ImageOverlay, type OverlayPattern, useParallax } from "@httpjpg/ui";
import { memo } from "react";

import {
  type BlokSpacing,
  editableAttrs,
  sizesFromWidths,
  spacingCss,
  widthCss,
} from "../../lib/use-blok";
import { SbCaption } from "../caption/SbCaption";

export interface SbImageProps {
  blok: BlokSpacing & {
    _uid: string;
    image: StoryblokImage;
    alt?: string;
    caption?: StoryblokRichTextProps["data"];
    aspectRatio?: string;
    width?: CmsImageWidth;
    widthMd?: CmsImageWidth;
    widthLg?: CmsImageWidth;
    isLoadingEager?: boolean;
    fetchPriority?: "auto" | "high" | "low";
    blurOnLoad?: boolean;
    copyrightPosition?: "inline-white" | "inline-black" | "below" | "overlay";
    /** ASCII sparkle overlay around the image. @default "random" */
    overlay?: OverlayPattern;
    /** Strength of the parallax scroll effect (0 disables). @default 0 */
    parallax?: number;
  };
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
      {caption && <SbCaption data={caption} />}
    </Box>
  );
});

SbImage.displayName = "SbImage";
