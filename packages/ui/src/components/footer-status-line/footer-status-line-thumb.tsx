"use client";

import type { HTMLAttributes } from "react";

import { Box } from "../box/box";

export type FooterStatusLineThumbShape = "square" | "rounded" | "circle";

export interface FooterStatusLineThumbProps extends HTMLAttributes<HTMLSpanElement> {
  src: string;
  /**
   * Empty by default: these sit beside text that already names the thing, so
   * announcing them again is noise.
   */
  alt?: string;
  /** Width token. The height matches unless `aspect` is `auto`. */
  size?: string;
  /** `auto` lets a poster or record sleeve keep its own proportions. */
  aspect?: "square" | "auto";
  shape?: FooterStatusLineThumbShape;
  /** `contain` keeps badge art whole where `cover` would crop it. */
  fit?: "cover" | "contain";
  /** Renders low-res sprite art crisply, e.g. the PSN trophy pips. */
  pixelated?: boolean;
}

const RADIUS = { square: "none", rounded: "sm", circle: "full" } as const;

/**
 * The small image at the head of a status line — an avatar, a film poster, a
 * record sleeve. Wrapped rather than used raw so the sizes stay on the token
 * scale instead of drifting per widget.
 */
export function FooterStatusLineThumb({
  src,
  alt = "",
  size = "3",
  aspect = "square",
  shape = "rounded",
  fit = "cover",
  pixelated = false,
  ...props
}: FooterStatusLineThumbProps) {
  return (
    <Box
      as="span"
      {...props}
      css={{
        display: "inline-block",
        flexShrink: 0,
        width: size,
        height: aspect === "auto" ? "auto" : size,
        verticalAlign: "middle",
        borderRadius: RADIUS[shape],
        overflow: "hidden",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          display: "block",
          imageRendering: pixelated ? "pixelated" : undefined,
        }}
      />
    </Box>
  );
}
