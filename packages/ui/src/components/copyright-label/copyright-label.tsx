import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export type CopyrightPosition = "below" | "overlay" | "inline-black" | "inline-white";

export interface CopyrightLabelProps {
  /** Copyright text; the © symbol is prepended unless it is already present. */
  text?: string;
  /** Asset source/credit, rendered on its own line below the copyright. */
  source?: string;
  position?: CopyrightPosition;
  css?: SystemStyleObject;
}

const BASE_CSS: SystemStyleObject = {
  fontFamily: "sans",
  fontSize: "sm",
  opacity: 0.7,
  pointerEvents: "none",
};

const INLINE_CSS: SystemStyleObject = {
  ...BASE_CSS,
  position: "absolute",
  right: 2,
  bottom: 2,
  px: 1,
  py: 2,
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  zIndex: "docked",
};

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
      {text ? <>{formatCopyright(text)}</> : null}
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
          ...BASE_CSS,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
          p: 4,
          color: "white",
          boxSizing: "border-box",
          zIndex: "docked",
          ...cssProp,
        }}
      >
        {lines}
      </Box>
    );
  }

  if (position === "inline-black" || position === "inline-white") {
    return (
      <Box
        css={{
          ...INLINE_CSS,
          color: position === "inline-black" ? "black" : "white",
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
        ...BASE_CSS,
        py: 2,
        color: "currentColor",
        pointerEvents: undefined,
        ...cssProp,
      }}
    >
      {lines}
    </Box>
  );
}

function formatCopyright(text: string): string {
  const trimmed = text.trim();
  return trimmed.startsWith("©") ? trimmed : `© ${trimmed}`;
}
