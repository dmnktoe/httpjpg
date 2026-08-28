import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import type { ComparisonOrientation } from "./lib";

interface ImageComparisonSliderHandleProps {
  orientation: ComparisonOrientation;
  position: number;
  dragging: boolean;
}

const LINE_STYLES: Record<ComparisonOrientation, SystemStyleObject> = {
  horizontal: {
    top: 0,
    bottom: 0,
    width: "2px",
    transform: "translateX(-50%)",
  },
  vertical: {
    left: 0,
    right: 0,
    height: "2px",
    transform: "translateY(-50%)",
  },
};

const HANDLE_GLYPH: Record<ComparisonOrientation, string> = {
  horizontal: "[ ↔ ]",
  vertical: "[ ↕ ]",
};

export function ImageComparisonSliderHandle({
  orientation,
  position,
  dragging,
}: ImageComparisonSliderHandleProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <Box
      aria-hidden="true"
      style={isHorizontal ? { left: `${position}%` } : { top: `${position}%` }}
      css={{
        position: "absolute",
        zIndex: "docked",
        pointerEvents: "none",
        ...LINE_STYLES[orientation],
      }}
    >
      <Box
        css={{
          position: "absolute",
          inset: 0,
          bg: "white",
          boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.35)",
        }}
      />
      <Box
        css={{
          position: "absolute",
          top: "50%",
          left: "50%",
          zIndex: "docked",
          px: "2",
          py: "1",
          color: "white",
          fontFamily: "mono",
          fontSize: "xs",
          lineHeight: 1,
          letterSpacing: "0.12em",
          whiteSpace: "nowrap",
          bg: "rgba(0, 0, 0, 0.62)",
          border: "1px solid rgba(255, 255, 255, 0.45)",
          transform: dragging ? "translate(-50%, -50%) scale(0.94)" : "translate(-50%, -50%)",
          transition: dragging ? "none" : "transform 0.16s ease",
          userSelect: "none",
        }}
      >
        {HANDLE_GLYPH[orientation]}
      </Box>
    </Box>
  );
}
