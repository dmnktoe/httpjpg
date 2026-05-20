import type { StoryblokImage } from "@httpjpg/storyblok-utils";
import { Box, type OverlayPattern, Slideshow, type SlideshowProps } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbSlideshowProps {
  blok: BlokSpacing & {
    _uid: string;
    images: StoryblokImage[];
    aspectRatio?: SlideshowProps["aspectRatio"];
    effect?: SlideshowProps["effect"];
    autoplayDelay?: number;
    speed?: number;
    showNavigation?: boolean;
    animation?: SlideshowProps["animation"];
    animationDelay?: number;
    overlay?: OverlayPattern;
    showCounter?: boolean;
  };
}

export const SbSlideshow = memo(function SbSlideshow({ blok }: SbSlideshowProps) {
  const {
    images,
    aspectRatio = "16/9",
    effect = "slide",
    autoplayDelay = 7000,
    speed = 300,
    showNavigation = true,
    animation = "none",
    animationDelay = 0,
    overlay = "random",
    showCounter = true,
  } = blok;
  const editable = editableAttrs(blok);

  if (!images?.length) {
    return null;
  }

  return (
    <Box {...editable} css={spacingCss(blok)}>
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
        overlay={overlay}
        showCounter={showCounter}
      />
    </Box>
  );
});
