"use client";

import { Box } from "../box/box";
import { CopyrightLabel } from "../copyright-label/copyright-label";

export interface LightboxCaptionProps {
  caption?: string;
  copyright?: string;
  copyrightSource?: string;
}

/**
 * Caption and credit, below the frame rather than over the image.
 *
 * The `inline-*` copyright positions rotate the credit into the image's corner,
 * which works on a cropped thumbnail but fights a contained full-size view — so
 * the lightbox always renders the `below` variant and lets it read straight.
 */
export function LightboxCaption({ caption, copyright, copyrightSource }: LightboxCaptionProps) {
  if (!caption && !copyright && !copyrightSource) {
    return null;
  }

  return (
    <Box
      css={{
        display: "flex",
        flexShrink: 0,
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
      {(copyright || copyrightSource) && (
        <CopyrightLabel
          text={copyright}
          source={copyrightSource}
          position="below"
          css={{ ml: "auto", py: 0, fontFamily: "mono" }}
        />
      )}
    </Box>
  );
}
