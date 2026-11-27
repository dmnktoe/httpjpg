import { defineRecipe } from "@pandacss/dev";

/** Config recipe, not `cva`: Panda only pre-generates `cva` variants it sees as literals. */
export const paragraphRecipe = defineRecipe({
  className: "paragraph",
  staticCss: ["*"],

  base: {
    margin: 0,
    padding: 0,
    fontFamily: "sans",
    lineHeight: 1.5,
    textWrap: "pretty",
  },
  variants: {
    size: {
      sm: { fontSize: "sm" },
      md: { fontSize: "md" },
      lg: { fontSize: "lg" },
      xl: { fontSize: "xl" },
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
