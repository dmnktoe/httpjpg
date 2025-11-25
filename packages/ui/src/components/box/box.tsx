"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

/**
 * Extract the ref type from a component
 */
type PolymorphicRef<C extends ElementType> = ComponentPropsWithoutRef<C>["ref"];

/**
 * Box-specific props
 */
type BoxOwnProps<C extends ElementType = ElementType> = {
  /**
   * Semantic HTML element to render
   * @default "div"
   */
  as?: C;
  /**
   * Box content
   */
  children?: ReactNode;
  /**
   * Panda CSS style object for type-safe styling
   * Supports all CSS properties, tokens, conditions, and responsive syntax
   */
  css?: SystemStyleObject;
};

/**
 * Combined Box props with proper polymorphic typing
 * Merges Box-specific props with the native props of the rendered element
 */
export type BoxProps<C extends ElementType = "div"> = BoxOwnProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof BoxOwnProps>;

/**
 * Box - A polymorphic, type-safe layout primitive
 *
 * The foundational building block for all layout components. Provides
 * full Panda CSS styling capabilities with zero-runtime overhead through
 * static CSS extraction.
 *
 * **Features:**
 * - 🎯 Polymorphic: Render as any HTML element via `as` prop
 * - 🎨 Type-safe styling: Full autocomplete for CSS properties and design tokens
 * - 📱 Responsive: Built-in breakpoint support (sm, md, lg, xl, 2xl)
 * - 🌙 Conditions: Support for hover, focus, active, dark mode, etc.
 * - ⚡️ Zero-runtime: Styles extracted at build time
 * - ♿️ Accessible: Semantic HTML with proper ref forwarding
 *
 * **Design Tokens:**
 * Access your design system tokens directly in the css prop:
 * - Colors: `colors.*` (e.g., `colors.primary`, `colors.neutral.100`)
 * - Spacing: `spacing.*` (e.g., `spacing.4`, `spacing.8`)
 * - Radii: `radii.*` (e.g., `radii.sm`, `radii.lg`)
 * - Shadows: `shadows.*` (e.g., `shadows.sm`, `shadows.lg`)
 * - Typography: `fonts.*`, `fontWeights.*`, `lineHeights.*`
 *
 * **Responsive Syntax:**
 * ```tsx
 * <Box css={{
 *   padding: { base: 4, md: 8, lg: 12 },
 *   display: { base: "block", lg: "flex" }
 * }} />
 * ```
 *
 * **Conditions:**
 * ```tsx
 * <Box css={{
 *   bg: "colors.neutral.100",
 *   _hover: { bg: "colors.neutral.200" },
 *   _dark: { bg: "colors.neutral.800" }
 * }} />
 * ```
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Box css={{ p: 4, bg: "colors.neutral.100", borderRadius: "radii.lg" }}>
 *   Content
 * </Box>
 *
 * // Polymorphic rendering for semantic HTML
 * <Box as="section" css={{ minH: "100vh", display: "flex", flexDirection: "column" }}>
 *   Section content
 * </Box>
 *
 * <Box as="header" css={{ py: 4, borderBottom: "1px solid", borderColor: "colors.neutral.200" }}>
 *   Navigation
 * </Box>
 *
 * // Responsive design
 * <Box css={{
 *   padding: { base: 4, md: 6, lg: 8 },
 *   maxWidth: { base: "100%", lg: "1280px" },
 *   mx: "auto"
 * }}>
 *   Responsive container
 * </Box>
 *
 * // Interactive states
 * <Box
 *   as="button"
 *   css={{
 *     p: 4,
 *     bg: "colors.primary",
 *     borderRadius: "radii.md",
 *     cursor: "pointer",
 *     transition: "all 0.2s",
 *     _hover: { bg: "colors.primaryHover", transform: "translateY(-2px)" },
 *     _active: { transform: "scale(0.98)" },
 *     _focusVisible: { outline: "2px solid", outlineColor: "colors.primary" }
 *   }}
 * >
 *   Interactive Box
 * </Box>
 *
 * // Dark mode support
 * <Box css={{
 *   bg: "colors.neutral.50",
 *   color: "colors.neutral.900",
 *   _dark: {
 *     bg: "colors.neutral.900",
 *     color: "colors.neutral.50"
 *   }
 * }}>
 *   Dark mode aware
 * </Box>
 *
 * // Complex layout composition
 * <Box as="article" css={{ display: "grid", gap: 6, gridTemplateColumns: { base: "1fr", md: "2fr 1fr" } }}>
 *   <Box css={{ p: 6 }}>Main content</Box>
 *   <Box css={{ p: 6, bg: "colors.neutral.100" }}>Sidebar</Box>
 * </Box>
 * ```
 */
export const Box = forwardRef(
  <C extends ElementType = "div">(
    { as, children, css: cssProp, className, ...props }: BoxProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const Component = as || "div";

    // Apply base styles for consistent box model
    const baseStyles = css({
      boxSizing: "border-box",
    });

    // Combine base styles, custom CSS prop styles, and className
    const combinedClassName = cx(
      baseStyles,
      cssProp && css(cssProp),
      className,
    );

    return (
      <Component ref={ref} className={combinedClassName} {...props}>
        {children}
      </Component>
    );
  },
) as <C extends ElementType = "div">(
  props: BoxProps<C> & { ref?: PolymorphicRef<C> },
) => JSX.Element;

// Display name for better debugging experience
Box.displayName = "Box";
