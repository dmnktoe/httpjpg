"use client";

import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export type CopyrightPosition = "below" | "overlay" | "inline-black" | "inline-white";

export interface CopyrightLabelProps {
  text?: string;
  source?: string;
  position?: CopyrightPosition;
  css?: SystemStyleObject;
}

export function isInlineCopyright(position: CopyrightPosition): boolean {
  return position !== "below";
}

export function CopyrightLabel({
  text,
  source,
  position = "below",
  css: cssProp,
}: CopyrightLabelProps) {
  if (!text && !source) {
    return null;
  }

  const lines = (
    <>
      {text ? <>© {text}</> : null}
      {source ? (
        <Box as="span" css={{ display: "block" }}>
          {source}
        </Box>
      ) : null}
    </>
  );

  if (position === "overlay") {
    return (
      <Box
        css={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
          p: 4,
          fontFamily: "sans",
          fontSize: "sm",
          opacity: 0.7,
          color: "white",
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: "docked",
          ...cssProp,
        }}
      >
        {lines}
      </Box>
    );
  }

  if (position === "inline-black") {
    return (
      <Box
        css={{
          position: "absolute",
          right: 2,
          bottom: 2,
          px: 1,
          py: 2,
          fontFamily: "sans",
          fontSize: "sm",
          opacity: 0.7,
          color: "black",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          whiteSpace: "nowrap",
          zIndex: "docked",
          pointerEvents: "none",
          ...cssProp,
        }}
      >
        {lines}
      </Box>
    );
  }

  if (position === "inline-white") {
    return (
      <Box
        css={{
          position: "absolute",
          bottom: 2,
          right: 2,
          px: 1,
          py: 2,
          fontFamily: "sans",
          fontSize: "sm",
          opacity: 0.7,
          color: "white",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          zIndex: "docked",
          pointerEvents: "none",
          ...cssProp,
        }}
      >
        {lines}
      </Box>
    );
  }

  return (
    <Box
      css={{
        fontFamily: "sans",
        fontSize: "sm",
        opacity: 0.7,
        py: 2,
        color: "currentColor",
        ...cssProp,
      }}
    >
      {lines}
    </Box>
  );
}
