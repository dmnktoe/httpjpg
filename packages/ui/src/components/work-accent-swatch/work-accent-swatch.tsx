import type { SystemStyleObject } from "styled-system/types";

import { parseWorkAccent } from "../../lib/work-accent";
import { Box } from "../box/box";

export interface WorkAccentSwatchProps {
  color?: string | null;
  css?: SystemStyleObject;
}

/** Pixel chip for a work page's Project Accent Color — the web stand-in for the iOS tinted icon. */
export function WorkAccentSwatch({ color, css: cssProp }: WorkAccentSwatchProps) {
  const accent = parseWorkAccent(color);
  if (!accent) {
    return null;
  }

  return (
    <Box
      as="span"
      aria-hidden="true"
      data-work-accent-swatch
      style={{ backgroundColor: accent.hex }}
      css={{
        display: "inline-block",
        flexShrink: 0,
        w: "8px",
        h: "8px",
        mr: "0.35em",
        verticalAlign: "middle",
        boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.18)",
        imageRendering: "pixelated",
        ...cssProp,
      }}
    />
  );
}
