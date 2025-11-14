"use client";

import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export type IconName = "arrow-up" | "arrow-down" | "arrow-left" | "arrow-right";

export interface IconProps {
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
  ({ name, size = "32px", css: cssProp, ...props }, ref) => {
    return (
      <Box
        as="svg"
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        style={{
          width: typeof size === "number" ? `${size}px` : size,
          height: typeof size === "number" ? `${size}px` : size,
          fill: "currentColor",
        }}
        css={cssProp}
        {...props}
      >
        {icons[name]}
      </Box>
    );
  },
);

Icon.displayName = "Icon";
