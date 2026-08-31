"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { AnimationMap, type AnimationType } from "./animation-map";

export type { AnimationType };

export interface AnimateInViewProps {
  animation?: AnimationType;
  once?: boolean;
  duration?: number;
  delay?: number;
  /** Stay fully visible until true so a skeleton is never hidden by the tween. */
  ready?: boolean;
  children: ReactNode;
  css?: SystemStyleObject;
}

export function AnimateInView({
  animation = "zoomIn",
  once = true,
  duration = 0.6,
  delay,
  ready = true,
  children,
  css: cssProp,
  ...props
}: AnimateInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(ref, {
    once,
    margin: "0px 0px -40px 0px",
    amount: 0.01,
  });
  const variants = animation && animation !== "none" ? AnimationMap[animation] : undefined;
  const show = isInView || !ready;

  if (!variants || prefersReducedMotion) {
    return (
      <div ref={ref} style={cssProp as CSSProperties} {...props}>
        {children}
      </div>
    );
  }

  return (
    <m.div
      ref={ref}
      variants={variants}
      transition={{
        delay,
        duration,
        ease: "easeOut",
      }}
      initial={ready ? "hidden" : "visible"}
      animate={show ? "visible" : "hidden"}
      style={cssProp as CSSProperties}
      {...props}
    >
      {children}
    </m.div>
  );
}
