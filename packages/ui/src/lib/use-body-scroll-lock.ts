"use client";

import { useEffect } from "react";

interface BodyStyles {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  overscrollBehavior: string;
  paddingRight: string;
}

// Reference-counted because the mobile menu and the command palette can both
// be open at once. Only the first holder freezes the body and remembers where
// the page was, and only the last one puts it back — otherwise whichever closed
// first would hand scrolling back while the other still covered the page, and
// would restore a scroll position captured after the body was already fixed.
let lockCount = 0;
let previous: BodyStyles | null = null;
let lockedScrollY = 0;

function freeze() {
  const { body } = document;
  lockedScrollY = window.scrollY;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  previous = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
    overscrollBehavior: body.style.overscrollBehavior,
    paddingRight: body.style.paddingRight,
  };

  // `overflow: hidden` alone does nothing here: globals.css sets
  // `overflow-x: clip` on <html>, which stops the body's overflow propagating
  // to the viewport. Taking the body out of flow is also what holds on iOS.
  body.style.position = "fixed";
  body.style.top = `${-lockedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  body.style.overscrollBehavior = "none";
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function thaw() {
  if (!previous) {
    return;
  }
  const { body } = document;
  body.style.position = previous.position;
  body.style.top = previous.top;
  body.style.left = previous.left;
  body.style.right = previous.right;
  body.style.width = previous.width;
  body.style.overflow = previous.overflow;
  body.style.overscrollBehavior = previous.overscrollBehavior;
  body.style.paddingRight = previous.paddingRight;
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

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        thaw();
      }
    };
  }, [isLocked]);
}
