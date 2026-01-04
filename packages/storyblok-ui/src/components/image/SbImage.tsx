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
    imageWidth?: string;
    isFullHeight?: boolean;
    isLoadingEager?: boolean;
    spacingTop?: string;
    spacingBottom?: string;
    copyright?: string;
    copyrightPosition?: "inline-white" | "inline-black" | "below" | "overlay";
  };
}

// Default image width for Storyblok image service when aspect ratio is specified
const DEFAULT_IMAGE_WIDTH = 1200;

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
    width = "full",
    imageWidth,
    isFullHeight = false,
    isLoadingEager = false,
    spacingTop,
    spacingBottom,
    copyright,
    copyrightPosition = "inline-white",
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  if (!image?.filename) {
    return null;
  }

  // Debug: Check if imageWidth arrives from Storyblok
  if (typeof window !== "undefined" && imageWidth) {
    console.log("[SbImage] imageWidth:", imageWidth);
  }

  // Process image with Storyblok image service (or return external URL as-is)
  // Calculate dimensions based on aspect ratio
  let cropDimensions = "";
  if (aspectRatio) {
    const parts = aspectRatio.split("/");
    if (parts.length === 2) {
      const [widthRatio, heightRatio] = parts.map((part) =>
        Number(part.trim()),
      );
      // Validate that both ratios are valid positive finite numbers
      if (
        widthRatio > 0 &&
        heightRatio > 0 &&
        Number.isFinite(widthRatio) &&
        Number.isFinite(heightRatio)
      ) {
        const calculatedHeight = Math.round(
          (DEFAULT_IMAGE_WIDTH * heightRatio) / widthRatio,
        );
        cropDimensions = `${DEFAULT_IMAGE_WIDTH}x${calculatedHeight}`;
      }
    }
  }

  const processedSrc = getProcessedImage(
    image.filename,
    cropDimensions,
    image.focus || "",
    "",
  );

  // Use copyright from custom field first, fallback to image copyright
  const finalCopyright = copyright || image.copyright || "";

  // Calculate width based on imageWidth value
  const calculatedWidth =
    imageWidth === "original" || imageWidth === "auto"
      ? "auto"
      : imageWidth
        ? `${imageWidth}%`
        : aspectRatio
          ? "100%"
          : "auto";

  return (
    <SbMediaWrapper
      spacingTop={spacingTop}
      spacingBottom={spacingBottom}
      width={width}
      editable={editableProps}
    >
      <Image
        src={processedSrc}
        alt={alt || image.alt || image.title || ""}
        copyright={finalCopyright}
        copyrightPosition={copyrightPosition}
        style={{
          width: calculatedWidth,
        }}
        css={{
          maxWidth: "100%",
          height: isFullHeight ? "100vh" : "auto",
          objectFit: aspectRatio ? "cover" : "none",
          aspectRatio: aspectRatio || undefined,
        }}
        loading={isLoadingEager ? "eager" : "lazy"}
      />

      {caption && <SbCaption data={caption} />}
    </SbMediaWrapper>
  );
});
