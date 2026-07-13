"use client";

import type { ImgHTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { isExternalLink } from "../../lib/is-external-link";

export interface BadgeProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "css" | "height"> {
  /** Badge image URL, e.g. a shields.io SVG. */
  src: string;
  alt: string;
  /** Wrap the badge in a link. External URLs open in a new tab. */
  href?: string;
  /** Rendered height; width scales to preserve the badge's aspect ratio. @default "1.5em" */
  height?: string;
  css?: SystemStyleObject;
}

export const Badge = forwardRef<HTMLImageElement, BadgeProps>(function Badge(
  { src, alt, href, height = "1.5em", loading = "lazy", className, css: cssProp, style, ...props },
  ref,
) {
  const image = (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={loading}
      className={cx(
        css({
          display: "inline-block",
          width: "auto",
          maxWidth: "100%",
          verticalAlign: "middle",
          ...cssProp,
        }),
        className,
      )}
      style={{ height, ...style }}
      {...props}
    />
  );

  if (!href) {
    return image;
  }

  const external = isExternalLink(href);
  return (
    <a
      href={href}
      className={css({ display: "inline-flex", lineHeight: "0", verticalAlign: "middle" })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {image}
    </a>
  );
});

Badge.displayName = "Badge";
