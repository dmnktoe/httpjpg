/**
 * Typography design tokens
 * Strong typography hierarchy following brutalistic design principles
 */

export const typography = {
  fontFamily: {
    sans: ["Arial", "Helvetica", "sans-serif"],
    headline: ["Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
    accent: [
      "Trattatello",
      "Snell Roundhand",
      "Bradley Hand",
      "Brush Script MT",
      "cursive",
    ],
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      "monospace",
    ],
  },
  fontSize: {
    // Component size system (Paragraph/Button)
    "2xs": "0.625rem", // 10px
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    base: "1rem", // 16px - default body size
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
  },
  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;

export type Typography = typeof typography;
