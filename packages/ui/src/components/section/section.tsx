"use client";

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { type ResponsiveSpacing, responsiveSpacingVars } from "../../lib/spacing-var";
import { Box } from "../box/box";
import { Container, type ContainerProps } from "../container/container";

export interface SectionProps extends Omit<ComponentPropsWithoutRef<"section">, "css"> {
  children: ReactNode;
  pt?: ResponsiveSpacing;
  pb?: ResponsiveSpacing;
  pl?: ResponsiveSpacing;
  pr?: ResponsiveSpacing;
  fullWidth?: boolean;
  /** Wrap `children` in `<Container>`. Off by default — opt in per section. */
  useContainer?: boolean;
  containerSize?: ContainerProps["size"];
  containerAlign?: "left" | "center";
  css?: SystemStyleObject;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      pt = "16",
      pb = "16",
      pl = "0",
      pr = "0",
      fullWidth = true,
      useContainer = false,
      containerSize = "2xl",
      containerAlign = "center",
      css: cssProp,
      style,
      ...props
    },
    ref,
  ) => (
    <Box
      ref={ref}
      as="section"
      css={{
        pt: { base: "var(--section-pt)", md: "var(--section-pt-md)", lg: "var(--section-pt-lg)" },
        pb: { base: "var(--section-pb)", md: "var(--section-pb-md)", lg: "var(--section-pb-lg)" },
        pl: { base: "var(--section-pl)", md: "var(--section-pl-md)", lg: "var(--section-pl-lg)" },
        pr: { base: "var(--section-pr)", md: "var(--section-pr-md)", lg: "var(--section-pr-lg)" },
        w: fullWidth ? "full" : undefined,
        ...cssProp,
      }}
      style={
        {
          ...responsiveSpacingVars("section-pt", pt),
          ...responsiveSpacingVars("section-pb", pb),
          ...responsiveSpacingVars("section-pl", pl),
          ...responsiveSpacingVars("section-pr", pr),
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {useContainer ? (
        <Container size={containerSize} center={containerAlign === "center"}>
          {children}
        </Container>
      ) : (
        children
      )}
    </Box>
  ),
);

Section.displayName = "Section";
