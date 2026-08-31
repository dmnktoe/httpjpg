"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { AnimationMap, type AnimationType } from "./animation-map";

export type { AnimationType };

export interface AnimateInViewProps {
  animation?: AnimationType;
  once?: boolean;
  duration?: number;
  delay?: number;
  /**
   * Keep the node fully visible until this is true so a skeleton or
   * blur-up placeholder is never hidden by the entrance tween.
   */
  ready?: boolean;
  children: ReactNode;
  css?: SystemStyleObject;
}

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }
  return rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
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
  const observerInView = useInView(ref, {
    once,
    margin: "0px 0px -40px 0px",
    amount: 0.01,
  });
  const [alreadyVisible, setAlreadyVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && isInViewport(el)) {
      setAlreadyVisible(true);
    }
  }, []);

  const variants = animation && animation !== "none" ? AnimationMap[animation] : undefined;
  const isInView = observerInView || alreadyVisible;
  const holdVisible = !ready;
  const show = isInView || holdVisible;

  if (!variants || prefersReducedMotion) {
    return (
      <div ref={ref} style={cssProp as React.CSSProperties} {...props}>
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
      initial={alreadyVisible || holdVisible ? "visible" : "hidden"}
      animate={show ? "visible" : "hidden"}
      style={cssProp as React.CSSProperties}
      {...props}
    >
      {children}
    </m.div>
  );
}
