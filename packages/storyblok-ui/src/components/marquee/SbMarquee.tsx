import { Box, Marquee } from "@httpjpg/ui";
import { memo } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbMarqueeProps {
  blok: BlokSpacing & {
    _uid: string;
    text: string;
    speed?: number;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    repeat?: number;
    iosStyle?: boolean;
    pauseDuration?: number;
    bgColor?: string;
    textColor?: string;
  };
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
