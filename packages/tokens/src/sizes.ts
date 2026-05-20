/**
 * Size design tokens
 * Common fixed sizes for elements like icons, indicators, etc.
 */

export const sizes = {
  icon: {
    xs: "12px",
    sm: "16px",
    md: "20px",
    lg: "24px",
    xl: "32px",
  },
  indicator: {
    xs: "6px",
    sm: "8px",
    md: "12px",
    lg: "16px",
  },
  widget: {
    sm: "200px",
    md: "300px",
    lg: "400px",
  },
} as const;

export type Sizes = typeof sizes;
