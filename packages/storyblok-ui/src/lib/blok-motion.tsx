"use client";

import { AnimateInView, type AnimationType } from "@httpjpg/ui";
import type { ReactNode } from "react";

const ANIMATIONS = new Set<AnimationType>([
  "none",
  "fadeIn",
  "zoomIn",
  "zoomSharpen",
  "sharpen",
  "slideInFromLeft",
  "slideInFromRight",
  "slideUp",
  "slideDown",
]);

export interface BlokMotionProps {
  animation?: string;
  delay?: number | string;
  children: ReactNode;
}

function toAnimation(value?: string): AnimationType | undefined {
  if (!value || !ANIMATIONS.has(value as AnimationType)) {
    return undefined;
  }
  return value as AnimationType;
}

function toDelay(value?: number | string): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** No-op when animation is unset / `none` so the extra wrapper stays off the default path. */
export function BlokMotion({ animation, delay, children }: BlokMotionProps) {
  const resolved = toAnimation(animation);
  if (!resolved || resolved === "none") {
    return children;
  }
  return (
    <AnimateInView animation={resolved} delay={toDelay(delay)}>
      {children}
    </AnimateInView>
  );
}
