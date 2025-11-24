"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { Container } from "../container/container";

export interface SectionProps
  extends Omit<ComponentPropsWithoutRef<"section">, "css"> {
  /**
   * Section content
   */
  children: ReactNode;
  /**
   * Padding top (using Panda spacing tokens: 0-96)
   * @default "16"
   */
  pt?: string | number;
  /**
   * Padding bottom (using Panda spacing tokens: 0-96)
   * @default "16"
   */
  pb?: string | number;
  /**
   * Padding left (using Panda spacing tokens: 0-96)
   * @default "0"
   */
  pl?: string | number;
  /**
   * Padding right (using Panda spacing tokens: 0-96)
   * @default "0"
   */
  pr?: string | number;
  /**
   * Full width
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Use container wrapper for content
   * @default true
   */
  useContainer?: boolean;
  /**
   * Container size when useContainer is true
   * @default "2xl"
   */
  containerSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "fluid";
  /**
   * CSS styles using Panda CSS style object
   */
  css?: SystemStyleObject;
}

/**
 * Section component - Semantic section wrapper built on Box
 *
 * Semantic HTML5 section element with Panda CSS token-based styling.
 * Uses the Box component under the hood with full Panda CSS style prop support.
 * Perfect for organizing portfolio content with consistent spacing.
 *
 * @example
 * ```tsx
 * // Using numeric tokens (maps to spacing scale)
 * <Section pt={16} pb={16}>
 *   <Container>
 *     <Headline>Section Title</Headline>
 *   </Container>
 * </Section>
 *
 * // Asymmetric padding with string tokens
 * <Section pt="24" pb="12" pl="4" pr="4">
 *   Content
 * </Section>
 *
 * // With additional Panda CSS props
 * <Section pt={16} pb={16} css={{ bg: "neutral.50", borderRadius: "lg" }}>
 *   Styled Section
 * </Section>
 * ```
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      pt = "16",
      pb = "16",
      pl = "0",
      pr = "0",
      fullWidth = true,
      useContainer = true,
      containerSize = "2xl",
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const content = useContainer ? (
      <Container size={containerSize} px="0" py="0">
        {children}
      </Container>
    ) : (
      children
    );

    return (
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
        {content}
      </Box>
    );
  },
);

Section.displayName = "Section";
