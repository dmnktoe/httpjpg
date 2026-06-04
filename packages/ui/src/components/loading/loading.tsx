"use client";

import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

const rainbowText = css({
  fontFamily: "sans",
  fontSize: "sm",
  letterSpacing: "0.05em",
  background:
    "linear-gradient(90deg, #f72585, #ff006e, #fee440, #00f5d4, #00bbf9, #9b5de5, #f72585)",
  backgroundSize: "200% auto",
  backgroundClip: "text",
  color: "transparent",
  animation: "rainbow 3s linear infinite",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as SystemStyleObject);

export function Loading() {
  return (
    <Box
      css={{
        position: "fixed",
        inset: 0,
        zIndex: "overlay",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        pointerEvents: "none",
      }}
      aria-live="polite"
    >
      <Box as="span" className={rainbowText}>
        Loading...
      </Box>
      <Box
        as="span"
        aria-hidden="true"
        css={{ opacity: 0.7, fontFamily: "mono", fontSize: "xs", letterSpacing: "0.2em" }}
      >
        ▰▰▰▱▱▱▰▰▰▱▱▱
      </Box>
    </Box>
  );
}
