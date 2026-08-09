"use client";

import { useEffect } from "react";

interface LockedStyles {
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverscrollBehavior: string;
}

// Reference-counted because the mobile menu and the command palette can both
// be open at once. Only the first holder freezes the body and remembers where
// the page was, and only the last one puts it back — otherwise whichever closed
// first would hand scrolling back while the other still covered the page, and
// would restore a scroll position captured after the body was already fixed.
let lockCount = 0;
let previous: LockedStyles | null = null;
let lockedScrollY = 0;

function freeze() {
  const { body, documentElement: html } = document;
  lockedScrollY = window.scrollY;
  previous = {
    htmlOverflow: html.style.overflow,
    htmlOverscrollBehavior: html.style.overscrollBehavior,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyOverscrollBehavior: body.style.overscrollBehavior,
  };

  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";

  body.style.position = "fixed";
  body.style.top = `${-lockedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overscrollBehavior = "none";
}

function reclamp() {
  if (!previous) {
    return;
  }
  const maxScrollY = Math.max(0, document.body.scrollHeight - window.innerHeight);
  if (lockedScrollY <= maxScrollY) {
    return;
  }
  lockedScrollY = maxScrollY;
  document.body.style.top = `${-lockedScrollY}px`;
}

function thaw() {
  if (!previous) {
    return;
  }
  const { body, documentElement: html } = document;
  html.style.overflow = previous.htmlOverflow;
  html.style.overscrollBehavior = previous.htmlOverscrollBehavior;
  body.style.position = previous.bodyPosition;
  body.style.top = previous.bodyTop;
  body.style.left = previous.bodyLeft;
  body.style.right = previous.bodyRight;
  body.style.width = previous.bodyWidth;
  body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
  previous = null;
  window.scrollTo(0, lockedScrollY);
}

/** Freeze background scrolling while an overlay is open. */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    if (lockCount === 0) {
      freeze();
    }
    lockCount += 1;

    window.addEventListener("resize", reclamp);
    window.addEventListener("orientationchange", reclamp);

    return () => {
      window.removeEventListener("resize", reclamp);
      window.removeEventListener("orientationchange", reclamp);
      lockCount -= 1;
      if (lockCount === 0) {
        thaw();
      }
    };
  }, [isLocked]);
}
