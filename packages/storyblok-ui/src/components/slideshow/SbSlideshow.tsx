import type { SbSlideshowData } from "@httpjpg/storyblok-utils";
import { Box, Slideshow } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbSlideshowProps {
  blok: SbSlideshowData;
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

SbSlideshow.displayName = "SbSlideshow";
