import type { StoryblokRichTextProps } from "@httpjpg/storyblok-richtext";
import { StoryblokRichText } from "@httpjpg/storyblok-richtext";
import { getProcessedImage } from "@httpjpg/storyblok-utils";
import { Image } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";

export interface SbImageType {
  id: number;
  filename: string;
  alt?: string;
  focus?: string;
  name?: string;
  title?: string;
}

export interface SbImageProps {
  blok: {
    _uid: string;
    image: SbImageType;
    alt?: string;
    caption?: StoryblokRichTextProps["data"];
    aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "9/16";
    width?: "full" | "container" | "narrow";
    isFullHeight?: boolean;
    isLoadingEager?: boolean;
    spacingTop?: string;
    spacingBottom?: string;
  };
}

/**
 * Storyblok Image Component
 * Optimized image with Storyblok image service
 */
export function SbImage({ blok }: SbImageProps) {
  const {
    image,
    alt,
    caption,
    aspectRatio,
    width = "full",
    isFullHeight = false,
    isLoadingEager = false,
    spacingTop,
    spacingBottom,
  } = blok;

  if (!image?.filename) {
    return null;
  }

  // Process image with Storyblok image service
  const processedSrc = getProcessedImage(
    image.filename,
    aspectRatio ? aspectRatio.replace("/", "x") + "/1200x0" : "",
    image.focus || "",
    "",
  );

  return (
    <div
      {...storyblokEditable(blok)}
      style={{
        marginTop: spacingTop,
        marginBottom: spacingBottom,
      }}
    >
      <Image
        src={processedSrc || image.filename}
        alt={alt || image.alt || image.title || ""}
        css={{
          width: "100%",
          height: isFullHeight ? "100vh" : "auto",
          objectFit: "cover",
          aspectRatio: aspectRatio || undefined,
        }}
        loading={isLoadingEager ? "eager" : "lazy"}
      />

      {caption && (
        <div
          style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#666" }}
        >
          <StoryblokRichText data={caption} />
        </div>
      )}
    </div>
  );
}
