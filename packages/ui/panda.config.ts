import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from "@httpjpg/tokens";
import { defineConfig } from "@pandacss/dev";

// Generate spacing values from tokens for safelist
const spacingValues = Object.keys(spacing).map(Number);

// Generate grid column values (1-12 columns)
const gridColumns = Array.from(
  { length: 12 },
  (_, i) => `repeat(${i + 1}, 1fr)`,
);

/**
 * Helper function to convert token objects to Panda CSS token format
 */
function toPandaTokens<T extends Record<string, any>>(obj: T): any {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      result[key] = toPandaTokens(value);
    } else {
      result[key] = { value };
    }
  }

  return result;
}

export default defineConfig({
  // Preflight (CSS Reset) - enable for production
  preflight: true,

  // Where to look for your css declarations
  include: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "../../apps/storybook/stories/**/*.{ts,tsx}",
  ],

  // Files to exclude
  exclude: [],

  // Safelist - only for component props that are dynamic (via Storybook controls, etc.)
  // Most styling is now done via css prop which is statically extracted
  staticCss: {
    css: [
      {
        properties: {
          // Stack component props (used in Storybook Playground controls)
          justifyContent: [
            "start",
            "center",
            "end",
            "space-between",
            "space-around",
            "space-evenly",
          ],
          alignItems: ["start", "center", "end", "stretch", "baseline"],
          flexDirection: ["row", "column"],
          flexWrap: ["wrap", "nowrap"],

          // All spacing token values (auto-generated from design tokens)
          gap: spacingValues,
          marginTop: spacingValues,
          marginBottom: spacingValues,
          marginLeft: spacingValues,
          marginRight: spacingValues,
          paddingTop: spacingValues,
          paddingBottom: spacingValues,
          paddingLeft: spacingValues,
          paddingRight: spacingValues,

          // Grid component columns prop (auto-generated 1-12 + auto-fit)
          gridTemplateColumns: [
            ...gridColumns,
            "repeat(auto-fit, minmax(200px, 1fr))",
          ],

          // Divider component props
          borderTopStyle: ["solid", "dashed", "dotted"],
          borderBottomStyle: ["solid", "dashed", "dotted"],
        },
      },
    ],
  },

  // Conditions for responsive design and interactions
  conditions: {
    extend: {
      // Responsive breakpoints
      sm: "@media (min-width: 640px)",
      md: "@media (min-width: 768px)",
      lg: "@media (min-width: 1024px)",
      xl: "@media (min-width: 1280px)",
      "2xl": "@media (min-width: 1536px)",

      // Dark mode support
      dark: "@media (prefers-color-scheme: dark)",
      light: "@media (prefers-color-scheme: light)",

      // Interaction states
      hover: "&:is(:hover, [data-hover])",
      focus: "&:is(:focus, [data-focus])",
      focusVisible: "&:is(:focus-visible, [data-focus-visible])",
      active: "&:is(:active, [data-active])",
      disabled: "&:is(:disabled, [data-disabled])",

      // Motion preferences
      motionReduce: "@media (prefers-reduced-motion: reduce)",
      motionSafe: "@media (prefers-reduced-motion: no-preference)",
    },
  },

  // Global CSS for reset and base styles
  globalCss: {
    "*, *::before, *::after": {
      boxSizing: "border-box",
      margin: 0,
      padding: 0,
    },
    html: {
      lineHeight: 1.5,
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      WebkitTextSizeAdjust: "100%",
    },
    body: {
      fontFamily: "sans",
      color: "black",
    },
    "img, picture, video, canvas, svg": {
      display: "block",
      maxWidth: "100%",
    },
    "input, button, textarea, select": {
      font: "inherit",
    },
    "p, h1, h2, h3, h4, h5, h6": {
      overflowWrap: "break-word",
    },
  },

  // Theme configuration with design tokens
  theme: {
    extend: {
      tokens: {
        colors: toPandaTokens(colors),
        fonts: {
          sans: { value: typography.fontFamily.sans.join(", ") },
          mono: { value: typography.fontFamily.mono.join(", ") },
        },
        fontWeights: toPandaTokens(typography.fontWeight),
        letterSpacings: toPandaTokens(typography.letterSpacing),
        lineHeights: toPandaTokens(typography.lineHeight),
        spacing: toPandaTokens(spacing),
        radii: toPandaTokens(borderRadius),
        shadows: toPandaTokens(shadows),
      },
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // JSX Framework
  jsxFramework: "react",

  // Optimize for production AND development (better caching)
  minify: true,
  hash: true, // Enable hash for better long-term caching

  // Utilities configuration
  utilities: {
    extend: {
      // Add custom utilities if needed
    },
  },
});
