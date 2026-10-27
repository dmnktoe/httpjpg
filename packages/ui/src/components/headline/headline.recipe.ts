import { defineRecipe } from "@pandacss/dev";

const HEADLINE_FONT_SIZES = {
  1: "clamp(2.25rem, 5vw + 1rem, 3.75rem)",
  2: "clamp(1.875rem, 4vw + 1rem, 3rem)",
  3: "clamp(1.5rem, 3vw + 0.5rem, 2.25rem)",
  4: "clamp(1.25rem, 2vw + 0.25rem, 1.5rem)",
} as const;

/** Config recipe, not `cva`: Panda only pre-generates `cva` variants it sees as literals. */
export const headlineRecipe = defineRecipe({
  className: "headline",
  staticCss: ["*"],

  base: {
    margin: 0,
    padding: 0,
    fontFamily: "headline",
    fontWeight: "bold",
    letterSpacing: "tight",
    lineHeight: 1,
    textWrap: "balance",
  },
  variants: {
    level: {
      1: {
        fontSize: HEADLINE_FONT_SIZES[1],
        fontWeight: "black",
        letterSpacing: "tighter",
      },
      2: {
        fontSize: HEADLINE_FONT_SIZES[2],
        fontWeight: "extrabold",
        letterSpacing: "tighter",
      },
      3: { fontSize: HEADLINE_FONT_SIZES[3], fontWeight: "bold" },
      4: { fontSize: HEADLINE_FONT_SIZES[4], fontWeight: "bold" },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
      justify: { textAlign: "justify", textJustify: "inter-word", textWrap: "wrap" },
    },
  },
  defaultVariants: { level: 1 },
});
