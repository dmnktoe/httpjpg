"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { Container, type ContainerProps } from "../container/container";

type SpacingValue = string | number | Record<string, string | number>;

export interface SectionProps extends Omit<ComponentPropsWithoutRef<"section">, "css"> {
  children: ReactNode;
  pt?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  pr?: SpacingValue;
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
      ...props
    },
    ref,
  ) => (
    <Box
      ref={ref}
      as="section"
      css={{
        pt,
        pb,
        pl,
        pr,
        w: fullWidth ? "full" : undefined,
        ...cssProp,
      }}
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
