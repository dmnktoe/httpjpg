"use client";

import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import {
  type CmsImageWidth,
  getResponsiveImage,
  type StoryblokImage,
  type StoryblokLink,
} from "@httpjpg/storyblok-utils";
import { Box, ScrollPinImage } from "@httpjpg/ui";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import {
  type BlokSpacing,
  editableAttrs,
  sizesFromWidths,
  spacingCss,
  widthCss,
} from "../../lib/use-blok";
import { SbCaption } from "../caption/SbCaption";

export interface SbScrollPinImageProps {
  blok: BlokSpacing & {
    _uid: string;
    image: StoryblokImage;
    alt?: string;
    caption?: StoryblokRichTextProps["data"];
    aspectRatio?: string;
    width?: CmsImageWidth;
    widthMd?: CmsImageWidth;
    widthLg?: CmsImageWidth;
    /** CSS length, e.g. `100vh`, `150vh`, `800px`. */
    pinDistance?: string;
    maxClipRatio?: string;
    maxScale?: string;
    brackets?: boolean;
    showProgress?: boolean;
    copyrightPosition?: "inline-white" | "inline-black" | "below" | "overlay";
    fetchPriority?: "auto" | "high" | "low";
    link?: StoryblokLink;
  };
}

function toNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const SbScrollPinImage = memo(function SbScrollPinImage({ blok }: SbScrollPinImageProps) {
  const {
    image,
    alt,
    caption,
    aspectRatio = "16/9",
    width = "100%",
    widthMd,
    widthLg,
    pinDistance,
    maxClipRatio,
    maxScale,
    brackets = true,
    showProgress = true,
    copyrightPosition = "inline-white",
    fetchPriority,
    link,
  } = blok;
  const editable = editableAttrs(blok);

  if (!image?.filename) {
    return null;
  }

  const { src, srcSet } = getResponsiveImage(image.filename, {
    aspectRatio,
    focus: image.focus || "",
  });
  const sizes = sizesFromWidths({ width, widthMd, widthLg });
  const resolvedHref = link ? storyblokHref(link) : "";
  const href = resolvedHref || undefined;

  return (
    <Box
      {...editable}
      css={{
        mb: "4",
        ...widthCss({ width, widthMd, widthLg }),
        ...spacingCss(blok),
      }}
    >
      <ScrollPinImage
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || image.alt || image.title || ""}
        aspectRatio={aspectRatio}
        href={href}
        title={image.title}
        pinDistance={pinDistance || "100vh"}
        maxClipRatio={toNumber(maxClipRatio, 12)}
        maxScale={toNumber(maxScale, 1.15)}
        brackets={brackets}
        showProgress={showProgress}
        copyright={image.copyright || ""}
        copyrightPosition={copyrightPosition}
        fetchPriority={fetchPriority}
      />
      {caption && <SbCaption data={caption} />}
    </Box>
  );
});

SbScrollPinImage.displayName = "SbScrollPinImage";
