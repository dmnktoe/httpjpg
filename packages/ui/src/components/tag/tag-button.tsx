"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { tagRecipe } from "./lib";
import { TagMarker } from "./tag-marker";

export interface TagButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
  children: string;
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
      aria-pressed={isActive}
      className={cx(
        tagRecipe({ interactive: true, active: isActive }),
        cssProp && css(cssProp),
        className,
      )}
      {...props}
    >
      {showMarker && <TagMarker />}
      {children}
    </button>
  );
});

TagButton.displayName = "TagButton";
