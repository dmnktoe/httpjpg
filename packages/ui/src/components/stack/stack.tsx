"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal";
  gap?: string | number;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
  wrap?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
  fullHeight?: boolean;
  css?: SystemStyleObject;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "vertical",
      gap = "4",
      align = "stretch",
      justify = "start",
      wrap = false,
      fullWidth = false,
      fullHeight = false,
      className,
      children,
      css: cssProp,
      ...props
    },
    ref,
  ) => (
    <Box
      ref={ref}
      className={className}
      css={{
        display: "flex",
        flexDirection: direction === "vertical" ? "column" : "row",
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        w: fullWidth ? "full" : undefined,
        h: fullHeight ? "full" : undefined,
        ...cssProp,
      }}
      {...props}
    >
      {children}
    </Box>
  ),
);

Stack.displayName = "Stack";

export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>((props, ref) => (
  <Stack ref={ref} direction="vertical" {...props} />
));
VStack.displayName = "VStack";

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>((props, ref) => (
  <Stack ref={ref} direction="horizontal" {...props} />
));
HStack.displayName = "HStack";
