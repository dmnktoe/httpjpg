"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const el = ref.current;
    if (!el || isInViewport(el)) {
      return;
    }

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setAlreadyVisible(true);
            observer?.disconnect();
          }
        },
        { threshold: 0 },
      );
      observer.observe(el);
    }

    // Next.js can keep streamed content in a hidden slot for ~300ms before
    // swapping it in; re-check after that so sharpen does not stay stuck.
    const timeoutId = window.setTimeout(() => {
      if (isInViewport(el)) {
        setAlreadyVisible(true);
      }
    }, 400);

    return () => {
      observer?.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const variants = animation && animation !== "none" ? AnimationMap[animation] : undefined;
  const isInView = observerInView || alreadyVisible;

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
      initial={alreadyVisible ? "visible" : "hidden"}
      animate={isInView ? "visible" : "hidden"}
      style={cssProp as React.CSSProperties}
      {...props}
    >
      {children}
    </m.div>
  );
}
