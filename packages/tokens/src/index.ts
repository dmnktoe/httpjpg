/**
 * @httpjpg/tokens
 * Central design tokens package for the httpjpg monorepo
 * Provides type-safe design tokens for colors, typography, spacing, and more.
 *
 * @packageDocumentation
 */

export { type BorderRadius, borderRadius } from "./border-radius";
export { type Colors, colors } from "./colors";
export { type Opacity, opacity } from "./opacity";
export { type Shadows, shadows } from "./shadows";
export { type Sizes, sizes } from "./sizes";
export { type Spacing, spacing } from "./spacing";
export { type Transitions, transitions } from "./transitions";
export { type Typography, typography } from "./typography";
export {
  clamp,
  getColor,
  getSpacing,
  pxToRem,
  remToPx,
  responsiveSpacing,
} from "./utils";
export { type ZIndexKey, type ZIndexValue, zIndex } from "./z-index";

import { borderRadius } from "./border-radius";
import { colors } from "./colors";
import { opacity } from "./opacity";
import { shadows } from "./shadows";
import { sizes } from "./sizes";
import { spacing } from "./spacing";
import { transitions } from "./transitions";
import { typography } from "./typography";
import { zIndex } from "./z-index";

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
  opacity,
  transitions,
  sizes,
  zIndex,
} as const;

export type Tokens = typeof tokens;
