"use client";

import { m, useInView, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { AnimationMap, type AnimationType } from "./animation-map";

export type { AnimationType };

export interface AnimateInViewProps {
  animation?: AnimationType;
  once?: boolean;
  duration?: number;
  delay?: number;
  children: ReactNode;
  css?: SystemStyleObject;
}

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
  const isInView = useInView(ref, {
    once,
    margin: "0px 0px -100px 0px",
    amount: 0.3,
  });

  if (animation === "none") {
    return <div>{children}</div>;
  }

  const beforeAnimationState = prefersReducedMotion ? "hiddenReduced" : "hidden";

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
