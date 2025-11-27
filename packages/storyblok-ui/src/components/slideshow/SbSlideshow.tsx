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
    effect?:
      | "slide"
      | "fade"
      | "cube"
      | "coverflow"
      | "flip"
      | "cards"
      | "creative";
    autoplayDelay?: number;
    speed?: number;
    showNavigation?: boolean;
    animation?:
      | "none"
      | "fadeIn"
      | "zoomIn"
      | "sharpen"
      | "zoomSharpen"
      | "slideInFromLeft"
      | "slideInFromRight"
      | "slideUp"
      | "slideDown";
    animationDelay?: number;
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
    effect = "slide",
    autoplayDelay = 7000,
    speed = 300,
    showNavigation = true,
    animation = "none",
    animationDelay = 0,
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
      width={width}
      editable={storyblokEditable(blok)}
    >
      <Slideshow
        images={images.map((img) => ({
          url: img.filename,
          alt: img.alt || img.title || "",
          copyright: img.copyright,
          focus: img.focus,
        }))}
        aspectRatio={aspectRatio}
        effect={effect}
        autoplayDelay={autoplayDelay}
        speed={speed}
        showNavigation={showNavigation}
        animation={animation}
        animationDelay={animationDelay}
      />
    </SbMediaWrapper>
  );
});
