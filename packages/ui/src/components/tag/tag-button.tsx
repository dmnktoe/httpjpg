"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { formatGlyphDigits } from "../../lib/format";
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
  /** Rendered after the label in decorative digits, with the plain number kept for screen readers. */
  count?: number;
  css?: SystemStyleObject;
}

const countClass = css({ ml: "1", opacity: 0.5, fontFamily: "mono", fontSize: "xs" });

const srOnlyClass = css({
  position: "absolute",
  w: "1px",
  h: "1px",
  m: "-1px",
  p: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  clipPath: "inset(50%)",
});

export const TagButton = forwardRef<HTMLButtonElement, TagButtonProps>(function TagButton(
  { children, isActive = false, showMarker = true, count, className, css: cssProp, type, ...props },
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
      {count !== undefined && (
        <>
          <span aria-hidden="true" className={countClass}>
            {formatGlyphDigits(count)}
          </span>
          <span className={srOnlyClass}>{`, ${count}`}</span>
        </>
      )}
    </button>
  );
});

TagButton.displayName = "TagButton";
