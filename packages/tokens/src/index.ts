/**
 * @httpjpg/tokens
 * Central design tokens package for the httpjpg monorepo
 * Provides type-safe design tokens for colors, typography, spacing, and more.
 *
 * @packageDocumentation
 */

export { type BorderRadius, borderRadius } from "./border-radius";
export { type Colors, colors } from "./colors";
export { type Shadows, shadows } from "./shadows";
export { type Spacing, spacing } from "./spacing";
export { type Typography, typography } from "./typography";

import { borderRadius } from "./border-radius";
import { colors } from "./colors";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

/**
 * Complete design tokens object
 *
 * @example
 * ```ts
 * import { tokens } from '@httpjpg/tokens';
 * console.log(tokens.colors.neutral[500]); // '#737373'
 * ```
 */
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Tokens = typeof tokens;
