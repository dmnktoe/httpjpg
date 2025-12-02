/**
 * Shared Storybook helpers and constants
 * Auto-generated from design tokens for DRY stories
 */

import { spacing } from "@httpjpg/tokens";

/**
 * Spacing values from design tokens
 * Auto-generated from Object.keys(spacing)
 */
export const SPACING_OPTIONS = Object.keys(spacing).map(Number);

/**
 * Common spacing subset for most controls
 * Curated selection of most-used values
 */
export const COMMON_SPACING_OPTIONS = [0, 1, 2, 4, 6, 8, 12, 16];

/**
 * Extended spacing for padding/margin controls
 */
export const EXTENDED_SPACING_OPTIONS = [
  0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96,
];

/**
 * Flexbox/Grid alignment options
 */
export const ALIGN_OPTIONS = [
  "start",
  "center",
  "end",
  "stretch",
  "baseline",
] as const;

/**
 * Flexbox/Grid justify options
 */
export const JUSTIFY_OPTIONS = ["start", "center", "end", "stretch"] as const;

/**
 * Grid alignment options (alignItems)
 */
export const GRID_ALIGN_OPTIONS = [
  "start",
  "center",
  "end",
  "stretch",
] as const;

/**
 * Grid justify options (justifyItems)
 */
export const GRID_JUSTIFY_OPTIONS = [
  "start",
  "center",
  "end",
  "stretch",
] as const;

/**
 * Flex direction options
 */
export const FLEX_DIRECTION_OPTIONS = ["row", "column"] as const;

/**
 * Flex wrap options
 */
export const FLEX_WRAP_OPTIONS = ["wrap", "nowrap"] as const;

/**
 * Grid column options
 */
export const GRID_COLUMN_OPTIONS = [1, 2, 3, 4, 6, 12, "auto"] as const;

/**
 * Grid flow options
 */
export const GRID_FLOW_OPTIONS = [
  "row",
  "column",
  "row-dense",
  "column-dense",
] as const;

/**
 * Border style options
 */
export const BORDER_STYLE_OPTIONS = ["solid", "dashed", "dotted"] as const;

/**
 * Divider variant options
 */
export const DIVIDER_VARIANT_OPTIONS = [
  "solid",
  "dashed",
  "dotted",
  "ascii",
  "custom",
] as const;

/**
 * Divider orientation options
 */
export const DIVIDER_ORIENTATION_OPTIONS = ["horizontal", "vertical"] as const;

/**
 * Aspect ratio options
 */
export const ASPECT_RATIO_OPTIONS = [
  "1/1",
  "4/3",
  "16/9",
  "21/9",
  "9/16",
] as const;

/**
 * Object fit options for images
 */
export const OBJECT_FIT_OPTIONS = [
  "cover",
  "contain",
  "fill",
  "none",
  "scale-down",
] as const;

/**
 * Image caption position options
 */
export const CAPTION_POSITION_OPTIONS = ["inline", "below", "overlay"] as const;

/**
 * Container size options
 */
export const CONTAINER_SIZE_OPTIONS = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "fluid",
] as const;

/**
 * Button variant options
 */
export const BUTTON_VARIANT_OPTIONS = [
  "primary",
  "secondary",
  "outline",
  "disabled",
] as const;

/**
 * Headline level options
 */
export const HEADLINE_LEVEL_OPTIONS = [1, 2, 3] as const;

/**
 * HTML heading tag options
 */
export const HEADING_TAG_OPTIONS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
] as const;

/**
 * Reusable argTypes for spacing controls
 */
export const spacingArgType = (
  description: string,
  defaultValue: number | string = "4",
) => ({
  control: { type: "select" as const },
  options: COMMON_SPACING_OPTIONS,
  description,
  table: {
    defaultValue: { summary: String(defaultValue) },
  },
});

/**
 * Reusable argTypes for extended spacing controls (padding/margin)
 */
export const extendedSpacingArgType = (
  description: string,
  defaultValue: number | string = "16",
) => ({
  control: { type: "select" as const },
  options: EXTENDED_SPACING_OPTIONS,
  description,
  table: {
    defaultValue: { summary: String(defaultValue) },
  },
});

/**
 * Reusable argTypes for alignment
 */
export const alignArgType = (
  description: string,
  defaultValue = "stretch",
) => ({
  control: { type: "select" as const },
  options: ALIGN_OPTIONS,
  description,
  table: {
    defaultValue: { summary: defaultValue },
  },
});

/**
 * Reusable argTypes for justify
 */
export const justifyArgType = (
  description: string,
  defaultValue = "start",
) => ({
  control: { type: "select" as const },
  options: JUSTIFY_OPTIONS,
  description,
  table: {
    defaultValue: { summary: defaultValue },
  },
});
