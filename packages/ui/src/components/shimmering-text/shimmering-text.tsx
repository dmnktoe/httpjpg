"use client";

import { m, useInView, type UseInViewOptions, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { css } from "styled-system/css";
import { token } from "styled-system/tokens";
import type { SystemStyleObject } from "styled-system/types";

export interface ShimmeringTextProps {
  text: string;
  /** Seconds one sweep takes. @default 2 */
  duration?: number;
  /** Seconds before the first sweep. @default 0 */
  delay?: number;
  /** Sweep forever instead of once. @default true */
  repeat?: boolean;
  /** Seconds between sweeps when repeating. @default 0.5 */
  repeatDelay?: number;
  /** Wait until the text scrolls into view. @default true */
  startOnView?: boolean;
  /** Only trigger the in-view start once. @default false */
  once?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  /** Highlight width, multiplied by the character count. @default 2 */
  spread?: number;
  /** Text colour under the sweep. @default currentColor */
  color?: string;
  shimmerColor?: string;
  css?: SystemStyleObject;
}

const shimmerStyles = css({
  // Inline, not inline-block: an inline-block breaks a surrounding underline
  // and knocks the baseline out of the line of text it sits in.
  display: "inline",
  color: "transparent",
  backgroundSize: "250% 100%, auto",
  backgroundRepeat: "no-repeat, padding-box",
  backgroundClip: "text",
});

export function ShimmeringText({
  text,
  duration = 2,
  delay = 0,
  repeat = true,
  repeatDelay = 0.5,
  startOnView = true,
  once = false,
  inViewMargin,
  spread = 2,
  color = "currentColor",
  shimmerColor = token.var("colors.primary.300"),
  css: cssProp,
}: ShimmeringTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: inViewMargin });
  const prefersReducedMotion = useReducedMotion();

  // Reduced motion gets the plain string. Painting it through a transparent
  // background-clip and then not animating would leave a flat gradient, which
  // is worse than no effect at all.
  if (prefersReducedMotion) {
    return (
      <span ref={ref} className={cssProp && css(cssProp)} style={{ color }}>
        {text}
      </span>
    );
  }

  const spreadPx = text.length * spread;
  const sweep = `linear-gradient(90deg, transparent calc(50% - ${spreadPx}px), ${shimmerColor}, transparent calc(50% + ${spreadPx}px))`;
  const base = `linear-gradient(${color}, ${color})`;
  const shouldAnimate = !startOnView || isInView;

  return (
    <m.span
      ref={ref}
      className={cssProp ? `${shimmerStyles} ${css(cssProp)}` : shimmerStyles}
      style={{ backgroundImage: `${sweep}, ${base}`, WebkitBackgroundClip: "text" }}
      initial={{ backgroundPosition: "100% center", opacity: 0 }}
      animate={shouldAnimate ? { backgroundPosition: "0% center", opacity: 1 } : {}}
      transition={{
        backgroundPosition: {
          repeat: repeat ? Infinity : 0,
          repeatDelay,
          duration,
          delay,
          ease: "linear",
        },
        opacity: { duration: 0.3, delay },
      }}
    >
      {text}
    </m.span>
  );
}
