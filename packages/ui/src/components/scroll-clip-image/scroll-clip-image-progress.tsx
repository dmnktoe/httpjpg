import type { Ref } from "react";

import { Box } from "../box/box";

interface ScrollClipImageProgressProps {
  labelRef: Ref<HTMLSpanElement>;
}

export function ScrollClipImageProgress({ labelRef }: ScrollClipImageProgressProps) {
  return (
    <Box
      aria-hidden="true"
      css={{
        position: "absolute",
        top: 3,
        right: 3,
        zIndex: "docked",
        color: "white",
        fontFamily: "mono",
        fontSize: "xs",
        letterSpacing: "wider",
        pointerEvents: "none",
        userSelect: "none",
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
      }}
    >
      [ <span ref={labelRef}>00</span> / 99 ]
    </Box>
  );
}
