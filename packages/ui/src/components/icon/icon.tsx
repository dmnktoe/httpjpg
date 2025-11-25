"use client";

import type { SVGProps } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export type IconName =
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "play"
  | "pause"
  | "volume"
  | "volume-mute";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "css"> {
  /**
   * Icon name
   */
  name: IconName;
  /**
   * Icon size (width)
   */
  size?: string | number;
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

const icons: Record<IconName, JSX.Element> = {
  "arrow-up": (
    <path d="m26.71 10.29-10-10a1 1 0 0 0-1.41 0l-10 10 1.41 1.41L15 3.41V32h2V3.41l8.29 8.29z" />
  ),
  "arrow-down": (
    <path d="M16 4a1 1 0 0 1 1 1v25.59l8.29-8.29 1.41 1.41-10 10a1 1 0 0 1-1.41 0l-10-10 1.41-1.41L15 30.59V5a1 1 0 0 1 1-1z" />
  ),
  "arrow-left": (
    <path d="M10.29 26.71 0.29 16.71a1 1 0 0 1 0-1.41l10-10 1.41 1.41L3.41 15H32v2H3.41l8.29 8.29z" />
  ),
  "arrow-right": (
    <path d="m21.71 5.29 10 10a1 1 0 0 1 0 1.41l-10 10-1.41-1.41L28.59 17H0v-2h28.59l-8.29-8.29z" />
  ),
  play: <path d="M8 5v14l11-7z" />,
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </>
  ),
  volume: (
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  ),
  "volume-mute": (
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  ),
};

/**
 * Icon component - SVG icons
 *
 * Centralized icon system with scalable SVG icons.
 * Icons are rendered inline for maximum flexibility and styling control.
 *
 * @example
 * ```tsx
 * <Icon name="arrow-up" size="24px" />
 * <Icon name="arrow-right" css={{ color: "primary.500" }} />
 * ```
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = "32px", css: cssProp, style, ...props }) => {
    return (
      <Box
        as="svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={
          name === "play" ||
          name === "pause" ||
          name === "volume" ||
          name === "volume-mute"
            ? "0 0 24 24"
            : "0 0 32 32"
        }
        style={{
          width: typeof size === "number" ? `${size}px` : size,
          height: typeof size === "number" ? `${size}px` : size,
          fill: "currentColor",
          ...style,
        }}
        css={cssProp}
        role="img"
        aria-hidden="true"
        {...props}
      >
        {icons[name]}
      </Box>
    );
  },
);

Icon.displayName = "Icon";
