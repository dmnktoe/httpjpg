"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { tagRecipe } from "./lib";
import { TagMarker } from "./tag-marker";

export interface TagButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed" | "css"
> {
  children: string;
  /** Drives both the pressed state and the active styling. */
  isActive?: boolean;
  showMarker?: boolean;
  css?: SystemStyleObject;
}

export const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(function TagButton(
  { children, isActive = false, showMarker = true, className, css: cssProp, type, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cx(
        tagRecipe({ interactive: true, active: isActive }),
        cssProp && css(cssProp),
        className,
      )}
      {...props}
      // After the spread: `isActive` drives the styling, so a caller-supplied
      // `aria-pressed` could only ever disagree with what is on screen.
      aria-pressed={isActive}
    >
      {showMarker && <TagMarker />}
      {children}
    </button>
  );
});

TagButton.displayName = "TagButton";
