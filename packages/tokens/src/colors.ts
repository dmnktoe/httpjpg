/**
 * Color design tokens
 * Monochromatic palette with vibrant accent colors
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
  // Vibrant accent colors
  primary: {
    50: "#FFF1F2",
    100: "#FFE4E6",
    200: "#FECDD3",
    300: "#FDA4AF",
    400: "#FB7185",
    500: "#F43F5E", // Main primary color - vibrant rose/pink
    600: "#E11D48",
    700: "#BE123C",
    800: "#9F1239",
    900: "#881337",
    950: "#4C0519",
  },
  accent: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316", // Vibrant orange
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
    950: "#431407",
  },
} as const;

export type Colors = typeof colors;
