import { defineRecipe } from "@pandacss/dev";

export const navLinkRecipe = defineRecipe({
  className: "navLink",
  base: {
    display: "block",
    color: "inherit",
    fontFamily: "sans",
    fontSize: "inherit",
    lineHeight: "inherit",
    py: "2px",
    px: "2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textDecoration: "none",
    _hover: {
      textDecoration: "underline",
      textDecorationStyle: "wavy",
      textUnderlineOffset: "2px",
    },
    transition: "all 150ms ease-in-out",
    outline: "none",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "primary.500",
      outlineOffset: "2px",
    },
  },
  variants: {
    variant: {
      projects: {
        _before: { content: "'🎀 ୧ꔛꗃ˖ '", marginRight: "0.5em" },
      },
      websites: {
        _before: { content: "'(^‿^)-𝒷))) '", marginRight: "0.5em" },
      },
    },
  },
  defaultVariants: { variant: "projects" },
});
