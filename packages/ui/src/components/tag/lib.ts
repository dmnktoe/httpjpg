import { cva } from "styled-system/css";

export const tagRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1",
    px: "3",
    py: "1",
    color: "pageFg",
    fontFamily: "sans",
    fontSize: "sm",
    lineHeight: "none",
    whiteSpace: "nowrap",
    bg: "transparent",
    border: "1px solid",
    borderColor: "pageBorder",
    borderRadius: "full",
    transitionProperty: "color, background-color, border-color",
    transitionDuration: "fast",
    transitionTimingFunction: "easeOut",
  },
  variants: {
    interactive: {
      true: {
        cursor: "pointer",
        _hover: { borderColor: "pageFg" },
        _focusVisible: {
          outline: "2px solid",
          outlineColor: "primary.500",
          outlineOffset: "2px",
        },
      },
    },
    active: {
      true: {
        color: "pageBg",
        bg: "pageFg",
        borderColor: "pageFg",
      },
    },
  },
});
