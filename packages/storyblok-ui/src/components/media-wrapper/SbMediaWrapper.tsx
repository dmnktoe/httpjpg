/**
 * SbMediaWrapper component for Storyblok media components
 * Provides consistent spacing and width constraints
 */

import { Box } from "@httpjpg/ui";
import type { ReactNode } from "react";
import { memo } from "react";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapWidthToToken } from "../../lib/token-mapping";

export interface SbMediaWrapperProps {
  children: ReactNode;
  spacingTop?: string;
  spacingBottom?: string;
  width?: string;
  editable?: Record<string, unknown>;
}

/**
 * SbMediaWrapper component
 * Wraps media components with consistent spacing and layout
 */
export const SbMediaWrapper = memo(function SbMediaWrapper({
  children,
  spacingTop,
  spacingBottom,
  width,
  editable,
}: SbMediaWrapperProps) {
  return (
    <Box
      css={{
        mt: mapSpacingToToken(spacingTop),
        mb: mapSpacingToToken(spacingBottom),
        width: mapWidthToToken(width),
        mx: width === "container" || width === "narrow" ? "auto" : undefined,
      }}
      {...editable}
    >
      {children}
    </Box>
  );
});
