"use client";

import { useEffect } from "react";

// `overflow: hidden` on <body> is not a scroll lock on iOS Safari — the visual
// viewport keeps panning, so the page (and the sticky header with it) still
// scrolls behind a fixed overlay. Pinning the body with `position: fixed` at a
// negative offset is the variant that holds everywhere; the scroll position is
// captured on lock and restored on release so the page does not jump to the top.
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const { body } = document;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    // Taking the body out of flow removes the classic scrollbar on pointer
    // platforms; pad the gap so the layout underneath does not shift.
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      body.style.overscrollBehavior = previous.overscrollBehavior;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
