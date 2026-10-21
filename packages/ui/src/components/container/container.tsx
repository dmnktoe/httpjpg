"use client";

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { type ResponsiveSpacing, responsiveSpacingVars } from "../../lib/spacing-var";
import { Box } from "../box/box";

const sizeMap = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  fluid: "100%",
} as const;

export interface ContainerProps extends Omit<ComponentPropsWithoutRef<"div">, "css"> {
  children: ReactNode;
  size?: keyof typeof sizeMap;
  px?: ResponsiveSpacing;
  py?: ResponsiveSpacing;
  center?: boolean;
  css?: SystemStyleObject;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    { children, size = "lg", px = 4, py = 0, center = true, css: cssProp, style, ...props },
    ref,
  ) => (
    <Box
      ref={ref}
      css={{
        w: "full",
        maxW: "var(--container-max)",
        mx: center ? "auto" : "0",
        px: {
          base: "var(--container-px)",
          md: "var(--container-px-md)",
          lg: "var(--container-px-lg)",
        },
        py: {
          base: "var(--container-py)",
          md: "var(--container-py-md)",
          lg: "var(--container-py-lg)",
        },
        ...cssProp,
      }}
      style={
        {
          "--container-max": sizeMap[size] ?? sizeMap.lg,
          ...responsiveSpacingVars("container-px", px),
          ...responsiveSpacingVars("container-py", py),
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </Box>
  ),
);

Container.displayName = "Container";
