"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { AnimationMap, type AnimationType } from "./animation-map";

export interface AnimateInViewProps {
  /**
   * Animation type
   * @default "zoomIn"
   */
  animation?: AnimationType;
  /**
   * Only animate once
   * @default true
   */
  once?: boolean;
  /**
   * Animation duration in seconds
   * @default 0.6
   */
  duration?: number;
  /**
   * Animation delay in seconds
   */
  delay?: number;
  /**
   * Content to animate
   */
  children: ReactNode;
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * AnimateInView component - Scroll-triggered animations
 *
 * Animates children when they enter the viewport using Framer Motion.
 * Respects user's reduced motion preferences for accessibility.
 *
 * @example
 * ```tsx
 * <AnimateInView animation="fadeIn" delay={0.2}>
 *   <h1>This fades in</h1>
 * </AnimateInView>
 *
 * <AnimateInView animation="slideUp" duration={0.8}>
 *   <p>This slides up</p>
 * </AnimateInView>
 * ```
 */
export const AnimateInView = ({
  animation = "zoomIn",
  once = true,
  duration = 0.6,
  delay,
  children,
  css: cssProp,
  ...props
}: AnimateInViewProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, { once });

  // Don't animate if animation is disabled
  if (animation === "none") {
    return <div>{children}</div>;
  }

  const beforeAnimationState = prefersReducedMotion
    ? "hiddenReduced"
    : "hidden";

  return (
    <m.div
      ref={ref}
      variants={AnimationMap[animation]}
      transition={{
        delay,
        duration,
        ease: "easeOut",
      }}
      initial="hidden"
      animate={isInView ? "visible" : beforeAnimationState}
      style={cssProp as React.CSSProperties}
      {...props}
    >
      {children}
    </m.div>
  );
};
