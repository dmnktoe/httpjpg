"use client";

import type { SVGProps } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { ICONS, type IconName } from "./icons";

export { ICON_GROUPS, ICON_NAMES, ICONS, type IconName } from "./icons";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "css"> {
  name: IconName;
  /** Any CSS length, number (treated as px), or token-aware value. @default "1em" */
  size?: string | number;
  /** Override the default 2px stroke. */
  strokeWidth?: number | string;
  /** Optional accessible label. When omitted, the icon is `aria-hidden`. */
  label?: string;
  css?: SystemStyleObject;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = "1em", strokeWidth = 2, label, css: cssProp, style, ...props },
  ref,
) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <Box
      ref={ref}
      as="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="img"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      style={{
        width: dimension,
        height: dimension,
        flexShrink: 0,
        ...style,
      }}
      css={cssProp}
      {...props}
    >
      {ICONS[name]}
    </Box>
  );
});
