/**
 * Color design tokens
 * Monochromatic palette following brutalistic design principles
 */

export const colors = {
  black: "#000000",
  white: "#FFFFFF",
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0A0A0A",
  },
} as const;

export type Colors = typeof colors;
