import { Box, Headline } from "@httpjpg/ui";
import { css } from "styled-system/css";

const rainbowTextStyles = css({
  background:
    "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
  backgroundSize: "400% 400%",
  animation: "rainbow 3s ease infinite",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",

  "@keyframes rainbow": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
});

/**
 * Rainbow Loading Text Component
 * Animated gradient text for loading states
 */
export function Loading() {
  return (
    <Box
      as="main"
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minH: "100vh",
        p: "4",
      }}
    >
      <Headline level={1} className={rainbowTextStyles}>
        Loading...
      </Headline>
    </Box>
  );
}
