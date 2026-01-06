"use client";

import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { getProcessedImage } from "@httpjpg/storyblok-utils";
import { Image } from "@httpjpg/ui";
import { css } from "@httpjpg/ui/css";
import { memo } from "react";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";
import type { StoryblokImage } from "../../types";
import { SbCaption } from "../caption";
import { SbMediaWrapper } from "../media-wrapper";

// Predefine all responsive width classes so Panda generates them at build time
const RESPONSIVE_WIDTH_CLASSES = {
  "10%": css({ width: "100%", sm: { width: "10%" } }),
  "20%": css({ width: "100%", sm: { width: "20%" } }),
  "25%": css({ width: "100%", sm: { width: "25%" } }),
  "30%": css({ width: "100%", sm: { width: "30%" } }),
  "33.333333%": css({ width: "100%", sm: { width: "33.333333%" } }),
  "40%": css({ width: "100%", sm: { width: "40%" } }),
  "50%": css({ width: "100%", sm: { width: "50%" } }),
  "60%": css({ width: "100%", sm: { width: "60%" } }),
  "66.666667%": css({ width: "100%", sm: { width: "66.666667%" } }),
  "70%": css({ width: "100%", sm: { width: "70%" } }),
  "75%": css({ width: "100%", sm: { width: "75%" } }),
  "80%": css({ width: "100%", sm: { width: "80%" } }),
  "90%": css({ width: "100%", sm: { width: "90%" } }),
  "100%": css({ width: "100%", sm: { width: "100%" } }),
  auto: css({ width: "100%", sm: { width: "auto" } }),
} as const;

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
    blurOnLoad?: boolean;
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
    blurOnLoad = false,
    spacingTop,
    spacingBottom,
    copyright,
    copyrightPosition = "inline-white",
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  if (!image?.filename) {
    return null;
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

  // Generate blur placeholder if blurOnLoad is enabled
  const blurDataURL = blurOnLoad
    ? getProcessedImage(
        image.filename,
        "20x0", // Small width for blur placeholder
        image.focus || "",
        "",
      )
    : undefined;

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
      <div
        className={
          RESPONSIVE_WIDTH_CLASSES[
            calculatedWidth as keyof typeof RESPONSIVE_WIDTH_CLASSES
          ] || RESPONSIVE_WIDTH_CLASSES["100%"]
        }
      >
        <Image
          src={processedSrc}
          alt={alt || image.alt || image.title || ""}
          copyright={finalCopyright}
          copyrightPosition={copyrightPosition}
          blurOnLoad={blurOnLoad}
          blurDataURL={blurDataURL}
          css={{
            width: "100%",
            maxWidth: "100%",
            height: isFullHeight ? "100vh" : "auto",
            objectFit: aspectRatio ? "cover" : "none",
            aspectRatio: aspectRatio || undefined,
          }}
          loading={isLoadingEager ? "eager" : "lazy"}
        />
      </div>

      {caption && <SbCaption data={caption} />}
    </SbMediaWrapper>
  );
});
