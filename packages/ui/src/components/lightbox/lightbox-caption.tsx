"use client";

import { Box } from "../box/box";
import { CopyrightLabel } from "../copyright-label/copyright-label";

export interface LightboxCaptionProps {
  caption?: string;
  copyright?: string;
}

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
