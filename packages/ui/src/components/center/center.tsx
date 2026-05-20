"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface CenterProps extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  children: ReactNode;
  horizontal?: boolean;
  vertical?: boolean;
  useFlex?: boolean;
  minHeight?: string;
  css?: SystemStyleObject;
}

export const Center = forwardRef<HTMLDivElement, CenterProps>(
  (
    {
      children,
      horizontal = true,
      vertical = true,
      useFlex = false,
      minHeight = "auto",
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => (
    <Box
      ref={ref}
      className={className}
      css={{
        display: useFlex ? "flex" : "grid",
        justifyContent: useFlex && horizontal ? "center" : undefined,
        justifyItems: !useFlex && horizontal ? "center" : undefined,
        alignItems: vertical ? "center" : undefined,
        minH: minHeight,
        ...cssProp,
      }}
      {...props}
    >
      {children}
    </Box>
  ),
);

Center.displayName = "Center";
