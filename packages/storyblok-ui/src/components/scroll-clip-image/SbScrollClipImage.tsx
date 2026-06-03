"use client";

import type { SbScrollClipImageData } from "@httpjpg/storyblok-utils";
import { getResponsiveImage } from "@httpjpg/storyblok-utils";
import { Box, ScrollClipImage } from "@httpjpg/ui";
import { memo } from "react";

import { storyblokHref } from "../../lib/href";
import { editableAttrs, sizesFromWidths, spacingCss, widthCss } from "../../lib/use-blok";
import { SbCaption, type SbCaptionProps } from "../caption/SbCaption";

export interface SbScrollClipImageProps {
  blok: SbScrollClipImageData;
}

export const SbScrollClipImage = memo(function SbScrollClipImage({ blok }: SbScrollClipImageProps) {
  const {
    image,
    alt,
    caption,
    aspectRatio = "16/9",
    width = "100%",
    widthMd,
    widthLg,
    pin = false,
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
      <ScrollClipImage
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || image.alt || image.title || ""}
        aspectRatio={aspectRatio}
        href={href}
        title={image.title}
        pin={pin}
        pinDistance={pinDistance || "100vh"}
        maxClipRatio={maxClipRatio ?? 10}
        maxScale={maxScale ?? 1.1}
        brackets={brackets}
        showProgress={showProgress}
        copyright={image.copyright || ""}
        copyrightPosition={copyrightPosition}
        fetchPriority={fetchPriority}
      />
      {caption && <SbCaption data={caption as SbCaptionProps["data"]} />}
    </Box>
  );
});

SbScrollClipImage.displayName = "SbScrollClipImage";
