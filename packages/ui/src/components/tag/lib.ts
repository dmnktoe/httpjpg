import { cva } from "styled-system/css";

/**
 * One recipe behind every chip on the site. `Tag` renders it as a span,
 * `TagButton` as a button — the padding, radius and border must not drift
 * apart between the two, which is what happened when they were separate.
 */
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
