import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { tagRecipe } from "./lib";
import { TagMarker } from "./tag-marker";

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "css"> {
  children: string;
  /** Drops the `#` marker for tags that read as prose. @default true */
  showMarker?: boolean;
  css?: SystemStyleObject;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, showMarker = true, className, css: cssProp, ...props },
  ref,
) {
  return (
    <span ref={ref} className={cx(tagRecipe(), cssProp && css(cssProp), className)} {...props}>
      {showMarker && <TagMarker />}
      {children}
    </span>
  );
});

Tag.displayName = "Tag";
