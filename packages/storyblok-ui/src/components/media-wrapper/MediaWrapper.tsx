/**
 * MediaWrapper component for Storyblok media components
 * Provides consistent spacing and width constraints
 */

import { Box } from "@httpjpg/ui";
import type { ReactNode } from "react";
import { memo } from "react";
import { getLayoutStyles } from "../../lib/spacing-utils";

export interface MediaWrapperProps {
  children: ReactNode;
  spacingTop?: string;
  spacingBottom?: string;
  width?: "full" | "container" | "narrow";
  editable?: Record<string, unknown>;
}

/**
 * MediaWrapper component
 * Wraps media components with consistent spacing and layout
 */
export const MediaWrapper = memo(function MediaWrapper({
  children,
  spacingTop,
  spacingBottom,
  width,
  editable,
}: MediaWrapperProps) {
  return (
    <Box css={getLayoutStyles(spacingTop, spacingBottom, width)} {...editable}>
      {children}
    </Box>
  );
});
