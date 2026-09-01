"use client";

import { forwardRef, type ImgHTMLAttributes } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

/** Native size of `apps/portfolio/public/images/footer/cloudflare_logo.png`. */
const INTRINSIC_WIDTH = 596;
const INTRINSIC_HEIGHT = 104;

export const CLOUDFLARE_LOGO_SRC = "/images/footer/cloudflare_logo.png";

export interface CloudflareLogoProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "css" | "src" | "alt" | "height" | "width"
> {
  /** Public URL of the classic lockup PNG. */
  src?: string;
  /** Rendered height; width scales with the lockup. @default "16px" */
  height?: string;
  css?: SystemStyleObject;
}

/**
 * Classic Cloudflare lockup (glossy cloud + wordmark) from the site's
 * footer image, scaled to sit on a status line.
 */
export const CloudflareLogo = forwardRef<HTMLImageElement, CloudflareLogoProps>(
  function CloudflareLogo(
    { src = CLOUDFLARE_LOGO_SRC, height = "16px", css: cssProp, style, ...props },
    ref,
  ) {
    return (
      <Box
        ref={ref}
        as="img"
        src={src}
        alt="Cloudflare"
        width={INTRINSIC_WIDTH}
        height={INTRINSIC_HEIGHT}
        style={{ height, width: "auto", ...style }}
        css={{
          display: "block",
          flexShrink: 0,
          ...cssProp,
        }}
        {...props}
      />
    );
  },
);

CloudflareLogo.displayName = "CloudflareLogo";
