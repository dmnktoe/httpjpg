"use client";

import { useEffect, useRef, useState } from "react";

export interface UseParallaxOptions {
  /** Travel as a fraction of the element's height; offset is bounded to `±height * speed`. @default 0.15 */
  speed?: number;
  /** Skip work entirely (e.g. for users who prefer reduced motion). */
  disabled?: boolean;
}

/**
 * Returns a ref to attach to the moving layer plus a translateY (in px) that
 * tracks the element's position in the viewport. Idle when offscreen.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>({
  speed = 0.15,
  disabled = false,
}: UseParallaxOptions = {}) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (disabled || typeof window === "undefined") {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    const el = ref.current;
    if (!el) {
      return;
    }

    let rafId = 0;
    let inView = false;
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      // -1 as the element enters from the bottom, +1 as it leaves the top.
      const center = rect.top + rect.height / 2;
      const range = (viewportH + rect.height) / 2;
      const normalized = range > 0 ? Math.max(-1, Math.min(1, (range - center) / range)) : 0;
      setOffset(normalized * rect.height * speed);
    };

    const onScroll = () => {
      if (!inView || ticking) {
        return;
      }
      ticking = true;
      rafId = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting;
          if (inView) {
            update();
          }
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed, disabled]);

  return { ref, offset };
}
