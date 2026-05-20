"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

const sizeMap = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  fluid: "100%",
} as const;

type SpacingValue = string | number | Record<string, string | number>;

export interface ContainerProps extends Omit<ComponentPropsWithoutRef<"div">, "css"> {
  children: ReactNode;
  size?: keyof typeof sizeMap;
  px?: SpacingValue;
  py?: SpacingValue;
  center?: boolean;
  css?: SystemStyleObject;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = "lg", px = 4, py = 0, center = true, css: cssProp, ...props }, ref) => (
    <Box
      ref={ref}
      css={{
        w: "full",
        maxW: sizeMap[size],
        mx: center ? "auto" : "0",
        px,
        py,
        ...cssProp,
      }}
      {...props}
    >
      {children}
    </Box>
  ),
);

Container.displayName = "Container";
