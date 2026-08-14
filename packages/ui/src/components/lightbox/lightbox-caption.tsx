"use client";

import { Box } from "../box/box";
import { CopyrightLabel } from "../copyright-label/copyright-label";

export interface LightboxCaptionProps {
  caption?: string;
  copyright?: string;
}

/**
 * Caption and credit, below the frame rather than over the image.
 *
 * The `inline-*` copyright positions rotate the credit into the image's corner,
 * which works on a cropped thumbnail but fights a contained full-size view — so
 * the lightbox always renders the `below` variant and lets it read straight.
 */
export function LightboxCaption({ caption, copyright }: LightboxCaptionProps) {
  if (!caption && !copyright) {
    return null;
  }

  return (
    <Box
      css={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "2",
        px: "3",
        py: "2",
        color: "pageFg",
        borderColor: "pageBorder",
        borderTop: "1px solid",
      }}
    >
      {caption && (
        <Box as="p" css={{ margin: 0, opacity: 0.8, fontFamily: "sans", fontSize: "sm" }}>
          {caption}
        </Box>
      )}
      {copyright && (
        <CopyrightLabel
          text={copyright}
          position="below"
          css={{ ml: "auto", py: 0, fontFamily: "mono", whiteSpace: "nowrap" }}
        />
      )}
    </Box>
  );
}
