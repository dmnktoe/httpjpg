"use client";

import { useEffect, useRef, useState } from "react";

export interface UseParallaxOptions {
  /**
   * Travel as a fraction of the element's own height: at the extremes the
   * element shifts by `±height * speed`. Keeping the travel proportional and
   * bounded means the consumer can give the moving layer a matching overscan
   * (scale) so the parallax never drifts out of its slot. @default 0.15
   */
  speed?: number;
  /** Skip work entirely (e.g. for users who prefer reduced motion). */
  disabled?: boolean;
}

/**
 * Returns a ref to attach to the moving layer plus a translateY (in px) that
 * tracks the element's position in the viewport. The offset is bounded to
 * `±height * speed` so a wrapper scaled by `1 + 2 * speed` always stays
 * covered. Idle when the element is offscreen.
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
      // Normalised position of the element as it crosses the viewport:
      // -1 just as it enters from the bottom, +1 just as it leaves the top.
      const center = rect.top + rect.height / 2;
      const range = (viewportH + rect.height) / 2;
      const normalized = range > 0 ? Math.max(-1, Math.min(1, (range - center) / range)) : 0;
      // Travel is a bounded fraction of the element's own height, so the image
      // shifts within its overscan instead of sliding out of its layout slot.
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
