import type { SbMarqueeData } from "@httpjpg/storyblok-utils";
import { Box, Marquee } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbMarqueeProps {
  blok: SbMarqueeData;
}

export const SbMarquee = memo(function SbMarquee({ blok }: SbMarqueeProps) {
  const {
    text,
    speed = 20,
    direction = "left",
    pauseOnHover,
    repeat = 3,
    iosStyle,
    pauseDuration = 2,
    bgColor,
    textColor,
  } = blok;
  const editable = editableAttrs(blok);

  if (!text) {
    return null;
  }

  return (
    <Box {...editable}>
      <Marquee
        speed={speed}
        direction={direction}
        pauseOnHover={pauseOnHover}
        repeat={repeat}
        iosStyle={iosStyle}
        pauseDuration={pauseDuration}
        css={{ backgroundColor: bgColor, color: textColor, ...spacingCss(blok) }}
      >
        {text}
      </Marquee>
    </Box>
  );
});

SbMarquee.displayName = "SbMarquee";
