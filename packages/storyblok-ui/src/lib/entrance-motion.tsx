import { CMS_OPTIONS, type CmsEntranceAnimation } from "@httpjpg/storyblok-utils";
import { AnimateInView } from "@httpjpg/ui";
import type { ReactNode } from "react";

/** Motion tab fields added by `withMotion()` in storyblok-sync. */
export interface BlokMotion {
  animation?: string;
  animationDelay?: number | string;
}

export interface EntranceMotionProps {
  blok: BlokMotion;
  children: ReactNode;
}

/**
 * Plays the blok's entrance animation once it scrolls into view. Unset / `none`
 * renders `children` as-is: no wrapper element and no client boundary.
 */
export function EntranceMotion({ blok, children }: EntranceMotionProps) {
  const animation = entranceAnimation(blok.animation);
  if (!animation) {
    return children;
  }
  return (
    <AnimateInView animation={animation} delay={entranceDelay(blok.animationDelay)}>
      {children}
    </AnimateInView>
  );
}

/** Typed as the CMS scale, so a value `AnimateInView` lacks fails type-check. */
function entranceAnimation(value?: string): CmsEntranceAnimation | undefined {
  if (!value || value === "none") {
    return undefined;
  }
  return (CMS_OPTIONS.entranceAnimation as readonly string[]).includes(value)
    ? (value as CmsEntranceAnimation)
    : undefined;
}

function entranceDelay(value?: number | string): number | undefined {
  const seconds = typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}
