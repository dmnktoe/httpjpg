"use client";

import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { getProcessedImage } from "@httpjpg/storyblok-utils";
import { Image } from "@httpjpg/ui";
import { memo } from "react";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";
import type { StoryblokImage } from "../../types";
import { SbCaption } from "../caption";
import { SbMediaWrapper } from "../media-wrapper";

export interface SbImageProps {
  blok: {
    _uid: string;
    image: StoryblokImage;
    alt?: string;
    caption?: StoryblokRichTextProps["data"];
    aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "9/16";
    width?: "full" | "container" | "narrow";
    isFullHeight?: boolean;
    isLoadingEager?: boolean;
    spacingTop?: string;
    spacingBottom?: string;
    copyright?: string;
    copyrightPosition?: "inline" | "below" | "overlay" | "vertical-right";
  };
}

/**
 * Storyblok Image Component
 * Optimized image with Storyblok image service
 */
export const SbImage = memo(function SbImage({ blok }: SbImageProps) {
  const {
    image,
    alt,
    caption,
    aspectRatio,
    isFullHeight = false,
    isLoadingEager = false,
    spacingTop,
    spacingBottom,
    copyright,
    copyrightPosition = "inline",
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  if (!image?.filename) {
    return null;
  }

  // Process image with Storyblok image service (or return external URL as-is)
  const processedSrc = getProcessedImage(
    image.filename,
    aspectRatio ? `${aspectRatio.replace("/", "x")}/1200x0` : "",
    image.focus || "",
    "",
  );

  // Use copyright from custom field first, fallback to image copyright
  const finalCopyright = copyright || image.copyright || "";

  return (
    <SbMediaWrapper
      spacingTop={spacingTop}
      spacingBottom={spacingBottom}
      editable={editableProps}
    >
      <Image
        src={processedSrc || image.filename}
        alt={alt || image.alt || image.title || ""}
        copyright={finalCopyright}
        copyrightPosition={copyrightPosition}
        css={{
          width: "100%",
          height: isFullHeight ? "100vh" : "auto",
          objectFit: "cover",
          aspectRatio: aspectRatio || undefined,
        }}
        loading={isLoadingEager ? "eager" : "lazy"}
      />

      {caption && <SbCaption data={caption} />}
    </SbMediaWrapper>
  );
});
