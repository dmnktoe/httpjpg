"use client";

import { Marquee } from "@httpjpg/ui";
import type { SbBlokData } from "@storyblok/react/rsc";
import { memo } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";
import type { BaseStoryblokProps } from "../../types";

/**
 * Storyblok Marquee Component Props
 */
export interface SbMarqueeProps extends BaseStoryblokProps {
  blok: SbBlokData & {
    _uid: string;
    component: "marquee";
    text: string;
    speed?: string;
    direction?: "left" | "right";
    pauseOnHover?: boolean;
    repeat?: string;
    iosStyle?: boolean;
    pauseDuration?: string;
    bgColor?: string;
    textColor?: string;
    marginTop?: string;
    marginBottom?: string;
    paddingY?: string;
  };
}

/**
 * SbMarquee - Storyblok Marquee Component
 *
 * Infinite scrolling text for announcements and ASCII decorations.
 * Wraps the base Marquee component with Storyblok integration.
 *
 * @example
 * ```tsx
 * <SbMarquee blok={{
 *   text: "⋆.˚ ᡣ𐭩 .𖥔˚ WELCOME ⋆.˚✮🎧✮˚.⋆",
 *   speed: "20",
 *   direction: "left"
 * }} />
 * ```
 */
export const SbMarquee = memo(function SbMarquee({ blok }: SbMarqueeProps) {
  const {
    text,
    speed,
    direction = "left",
    pauseOnHover = false,
    repeat,
    iosStyle = false,
    pauseDuration,
    bgColor,
    textColor,
    marginTop,
    marginBottom,
    paddingY,
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  // Parse numeric values from Storyblok strings
  const speedValue = speed ? Number.parseInt(speed, 10) : 20;
  const repeatValue = repeat ? Number.parseInt(repeat, 10) : 3;
  const pauseDurationValue = pauseDuration
    ? Number.parseFloat(pauseDuration)
    : 2;

  if (!text) {
    return null;
  }

  // Build spacing styles
  const spacingStyles: SystemStyleObject = {};
  if (marginTop) spacingStyles.mt = marginTop;
  if (marginBottom) spacingStyles.mb = marginBottom;
  if (paddingY) spacingStyles.py = paddingY;
  if (bgColor) spacingStyles.bg = bgColor;
  if (textColor) spacingStyles.color = textColor;

  return (
    <div {...editableProps}>
      <Marquee
        speed={speedValue}
        direction={direction}
        pauseOnHover={pauseOnHover}
        repeat={repeatValue}
        iosStyle={iosStyle}
        pauseDuration={pauseDurationValue}
        css={spacingStyles}
      >
        {text}
      </Marquee>
    </div>
  );
});
