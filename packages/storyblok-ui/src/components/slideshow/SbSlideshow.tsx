import { Slideshow } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";
import type { StoryblokImage } from "../../types";
import { SbMediaWrapper } from "../media-wrapper";

export interface SbSlideshowProps {
  blok: {
    _uid: string;
    images: StoryblokImage[];
    aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4" | "9/16";
    speed?: number;
    spacingTop?: string;
    spacingBottom?: string;
    width?: "full" | "container" | "narrow";
  };
}

/**
 * Storyblok Slideshow Component
 * Carousel/slideshow of images
 */
export const SbSlideshow = memo(function SbSlideshow({
  blok,
}: SbSlideshowProps) {
  const {
    images,
    aspectRatio = "16/9",
    speed = 1,
    spacingTop,
    spacingBottom,
    width = "full",
  } = blok;

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <SbMediaWrapper
      spacingTop={spacingTop}
      spacingBottom={spacingBottom}
      width={boundingWidth}
      editable={storyblokEditable(blok)}
    >
      <Slideshow
        images={images.map((img) => ({
          url: img.filename,
          alt: img.alt || img.title || "",
        }))}
        aspectRatio={aspectRatio}
        autoplayDelay={speed * 1000}
      />
    </SbMediaWrapper>
  );
});
