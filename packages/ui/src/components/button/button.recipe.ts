import { colors } from "@httpjpg/tokens";

import { hexToRgba, linearGradient } from "../../../panda.helpers";

// Build-time only: consumed by panda.config's `recipes` map, never imported at runtime.
export function buttonRecipe() {
  return {
    className: "button",
    base: {
      all: "unset",
      boxSizing: "border-box",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      borderRadius: "9999px",
      fontFamily: "sans",
      whiteSpace: "nowrap",
      textDecoration: "none",
      position: "relative",
      overflow: "visible",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      isolation: "isolate",
      _before: {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        zIndex: -1,
      },
      _focusVisible: {
        outline: `2px solid ${colors.primary[500]}`,
        outlineOffset: "2",
      },
      _disabled: {
        cursor: "not-allowed",
        opacity: 0.5,
        filter: "grayscale(0.5)",
      },
      _active: { transform: "scale(0.97) translateY(1px)" },
    },
    variants: {
      variant: {
        primary: {
          color: "white",
          _before: {
            background: hexToRgba(colors.primary[500], 0.9),
            filter: "blur(5px)",
            inset: "-3px",
            boxShadow: `0 0 20px 0 ${hexToRgba(colors.primary[500], 0.3)}, 0 0 40px 0 ${hexToRgba(colors.primary[500], 0.15)}`,
          },
          _hover: {
            _before: {
              background: hexToRgba(colors.primary[600], 0.95),
              filter: "blur(5px)",
              boxShadow: `0 0 25px 0 ${hexToRgba(colors.primary[600], 0.4)}, 0 0 45px 0 ${hexToRgba(colors.primary[600], 0.2)}`,
            },
          },
        },
        secondary: {
          color: "white",
          _before: {
            background: linearGradient("135deg", [
              { hex: colors.accent[400], alpha: 0.9 },
              { hex: colors.accent[600], alpha: 0.9 },
            ]),
            filter: "blur(5px)",
            inset: "-3px",
            boxShadow: `0 0 20px 0 ${hexToRgba(colors.accent[400], 0.3)}, 0 0 40px 0 ${hexToRgba(colors.accent[600], 0.15)}`,
          },
          _hover: {
            _before: {
              background: linearGradient("135deg", [
                { hex: colors.accent[400], alpha: 0.95 },
                { hex: colors.accent[600], alpha: 0.95 },
              ]),
              filter: "blur(5px)",
              boxShadow: `0 0 25px 0 ${hexToRgba(colors.accent[400], 0.4)}, 0 0 45px 0 ${hexToRgba(colors.accent[600], 0.2)}`,
            },
          },
        },
        danger: {
          color: "white",
          _before: {
            background: hexToRgba(colors.danger[500], 0.9),
            filter: "blur(5px)",
            inset: "-3px",
            boxShadow: `0 0 20px 0 ${hexToRgba(colors.danger[500], 0.3)}, 0 0 40px 0 ${hexToRgba(colors.danger[500], 0.15)}`,
          },
          _hover: {
            _before: {
              background: hexToRgba(colors.danger[600], 0.95),
              filter: "blur(5px)",
              boxShadow: `0 0 25px 0 ${hexToRgba(colors.danger[600], 0.4)}, 0 0 45px 0 ${hexToRgba(colors.danger[600], 0.2)}`,
            },
          },
        },
        outline: {
          color: "black",
          _before: {
            background: hexToRgba(colors.neutral[300], 0.5),
            filter: "blur(5px)",
            inset: "-3px",
            boxShadow: `0 0 2px 1px ${hexToRgba(colors.neutral[400], 0.3)}`,
          },
          _hover: {
            _before: {
              background: hexToRgba(colors.neutral[400], 0.6),
              filter: "blur(5px)",
              boxShadow: `0 0 4px 1px ${hexToRgba(colors.neutral[500], 0.4)}`,
            },
          },
        },
        disabled: {
          color: hexToRgba(colors.neutral[400], 0.7),
          cursor: "not-allowed",
          _before: {
            background: hexToRgba(colors.neutral[500], 0.3),
            filter: "blur(5px)",
            inset: "-3px",
            boxShadow: `0 0 15px 0 ${hexToRgba(colors.neutral[500], 0.2)}`,
          },
          _hover: {
            _before: {
              background: hexToRgba(colors.neutral[500], 0.3),
              filter: "blur(5px)",
              boxShadow: `0 0 15px 0 ${hexToRgba(colors.neutral[500], 0.2)}`,
            },
          },
        },
      },
      size: {
        sm: {
          fontSize: "sm",
          paddingX: "4",
          paddingY: "2",
          minHeight: "9",
          lineHeight: 1.5,
        },
        md: {
          fontSize: "md",
          paddingX: "7",
          paddingY: "3",
          minHeight: "11",
          lineHeight: 1.5,
        },
        lg: {
          fontSize: "lg",
          paddingX: "9",
          paddingY: "4",
          minHeight: "14",
          lineHeight: 1.5,
        },
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  } as const;
}
