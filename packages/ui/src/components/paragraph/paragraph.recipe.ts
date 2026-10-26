import { defineRecipe } from "@pandacss/dev";

/** Config recipe, not `cva`: Panda only pre-generates `cva` variants it sees as literals. */
export const paragraphRecipe = defineRecipe({
  className: "paragraph",
  staticCss: ["*"],

  base: {
    margin: 0,
    padding: 0,
    fontFamily: "sans",
    lineHeight: 1.75,
    textWrap: "pretty",
  },
  variants: {
    size: {
      sm: { fontSize: "sm", lineHeight: 1.75 },
      md: { fontSize: "md", lineHeight: 1.75 },
      lg: { fontSize: "lg", lineHeight: 1.8 },
      xl: { fontSize: "xl", lineHeight: 1.8 },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center", marginLeft: "auto", marginRight: "auto" },
      right: { textAlign: "right", marginLeft: "auto" },
      justify: { textAlign: "justify", textJustify: "inter-word" },
    },
    color: {
      default: { color: "pageFg", opacity: 1 },
      muted: { color: "pageFg", opacity: 0.7 },
      dimmed: { color: "pageFg", opacity: 0.5 },
    },
    weight: {
      normal: { fontWeight: 400 },
      medium: { fontWeight: 500 },
      semibold: { fontWeight: 600 },
    },
    spacing: {
      true: { marginBottom: 4 },
    },
  },
  defaultVariants: {
    size: "sm",
    align: "left",
    color: "default",
    weight: "normal",
    spacing: false,
  },
});
