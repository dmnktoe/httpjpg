import { ASCII_TAPE } from "../ascii-art/banners";
import { Box } from "../box/box";

interface SlideshowCounterProps {
  activeIndex: number;
  total: number;
}

export function SlideshowCounter({ activeIndex, total }: SlideshowCounterProps) {
  return (
    <Box
      css={{
        position: "absolute",
        bottom: "3",
        left: "3",
        zIndex: "docked",
        display: "flex",
        flexDirection: "column",
        gap: "0.5",
        color: "white",
        fontFamily: "mono",
        fontSize: "xs",
        letterSpacing: "0.15em",
        pointerEvents: "none",
        userSelect: "none",
        textShadow: "0 0 6px rgba(0,0,0,0.6)",
      }}
      aria-hidden="true"
    >
      <Box as="span">
        {String(activeIndex + 1).padStart(2, "0")}
        <Box as="span" css={{ mx: "1", opacity: 0.5 }}>
          /
        </Box>
        <Box as="span" css={{ opacity: 0.7 }}>
          {String(total).padStart(2, "0")}
        </Box>
      </Box>
      <Box as="span" css={{ opacity: 0.5, fontSize: "2xs" }}>
        {ASCII_TAPE}
      </Box>
    </Box>
  );
}
