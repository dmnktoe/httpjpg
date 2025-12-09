/**
 * Panda CSS Configuration
 * @version 1.7.0
 *
 * This configuration follows Panda CSS v1.7.0 best practices:
 * - Type-safe design tokens from centralized package
 * - Optimized build output with tree-shaking
 * - Enhanced developer experience with better type inference
 * - Production-ready with minification and hashing
 */

import {
  borderRadius,
  colors,
  opacity,
  shadows,
  sizes,
  spacing,
  transitions,
  typography,
} from "@httpjpg/tokens";
import { defineConfig } from "@pandacss/dev";

// Generate spacing values from tokens for static CSS generation
const spacingValues = Object.keys(spacing).map(Number);

// Generate grid column values (1-12 columns)
const gridColumns = Array.from(
  { length: 12 },
  (_, i) => `repeat(${i + 1}, 1fr)`,
);

/**
 * Helper function to convert token objects to Panda CSS token format
 * Recursively transforms nested objects into the { value } structure
 * that Panda CSS expects for design tokens
 */
function toPandaTokens<T extends Record<string, any>>(
  obj: T,
): Record<string, any> {
  const result: Record<string, any> = {};

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
  // Enable Preflight (modern CSS reset)
  // Provides consistent cross-browser baseline styles
  preflight: true,

  // Where to look for CSS declarations
  // Panda scans these paths for css(), cva(), and pattern usage
  include: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "../../apps/storybook/stories/**/*.{ts,tsx}",
    "../../apps/web/app/**/*.{ts,tsx}",
    "../../apps/web/components/**/*.{ts,tsx}",
  ],

  // Files to exclude from scanning
  // v1.7.0: Enhanced exclude patterns for better performance
  exclude: [
    "./node_modules/**",
    "./styled-system/**",
    "./.next/**",
    "./dist/**",
    "./.turbo/**",
  ],

  // Static CSS generation for dynamic props
  // Use sparingly - only for truly dynamic values (e.g., Storybook controls)
  // Most styling should use the css prop for optimal tree-shaking
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
          paddingBlock: spacingValues,
          paddingInline: spacingValues,

          // Grid component columns prop (auto-generated 1-12 + auto-fit)
          gridTemplateColumns: [
            ...gridColumns,
            "repeat(auto-fit, minmax(200px, 1fr))",
          ],

          // Divider component props
          borderTopStyle: ["solid", "dashed", "dotted"],
          borderBottomStyle: ["solid", "dashed", "dotted"],

          // Container component max-width values
          maxWidth: ["640px", "768px", "1024px", "1280px", "1536px", "100%"],

          // Button component blur effects (v1.7.0 requires explicit staticCss for cva recipes)
          filter: ["blur(5px)", "blur(8px)", "grayscale(0.5)"],
        },
      },
    ],
  },

  // Conditions for responsive design and interactions
  // These enable conditional styling via _hover, _dark, etc.
  conditions: {
    extend: {
      // Responsive breakpoints (mobile-first)
      sm: "@media (min-width: 640px)",
      md: "@media (min-width: 768px)",
      lg: "@media (min-width: 1024px)",
      xl: "@media (min-width: 1280px)",
      "2xl": "@media (min-width: 1536px)",

      // Dark mode support (system preference)
      dark: "@media (prefers-color-scheme: dark)",
      light: "@media (prefers-color-scheme: light)",

      // Interaction states with data attribute fallbacks
      // Supports both native pseudo-classes and controlled data attributes
      hover: "&:is(:hover, [data-hover])",
      focus: "&:is(:focus, [data-focus])",
      focusVisible: "&:is(:focus-visible, [data-focus-visible])",
      active: "&:is(:active, [data-active])",
      disabled: "&:is(:disabled, [data-disabled])",

      // Accessibility: Motion preferences
      motionReduce: "@media (prefers-reduced-motion: reduce)",
      motionSafe: "@media (prefers-reduced-motion: no-preference)",
    },
  },

  // Global CSS for base styles
  // Applied automatically when Panda CSS is initialized
  globalCss: {
    // Universal box-sizing reset (but don't reset padding/margin globally)
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },
    // Root HTML improvements
    html: {
      lineHeight: 1.5,
      WebkitFontSmoothing: "antialiased", // Better font rendering on macOS
      MozOsxFontSmoothing: "grayscale", // Better font rendering on Firefox/macOS
      WebkitTextSizeAdjust: "100%", // Prevent font scaling in landscape on iOS
    },
    // Body defaults using design tokens
    body: {
      fontFamily: "sans",
      fontSize: "sm",
      color: "black",
    },
    // Media element defaults
    "img, picture, video, canvas, svg": {
      display: "block",
      maxWidth: "100%",
    },
    // Form element inheritance
    "input, button, textarea, select": {
      font: "inherit",
    },
    // Typography improvements
    "p, h1, h2, h3, h4, h5, h6": {
      overflowWrap: "break-word", // Prevent text overflow
    },
  },

  // Theme configuration with design tokens
  theme: {
    extend: {
      tokens: {
        colors: toPandaTokens(colors),
        fonts: {
          sans: { value: typography.fontFamily.sans.join(", ") },
          headline: { value: typography.fontFamily.headline.join(", ") },
          accent: { value: typography.fontFamily.accent.join(", ") },
          mono: { value: typography.fontFamily.mono.join(", ") },
        },
        fontSizes: toPandaTokens(typography.fontSize),
        fontWeights: toPandaTokens(typography.fontWeight),
        letterSpacings: toPandaTokens(typography.letterSpacing),
        lineHeights: toPandaTokens(typography.lineHeight),
        spacing: toPandaTokens(spacing),
        radii: toPandaTokens(borderRadius),
        shadows: toPandaTokens(shadows),
        opacity: toPandaTokens(opacity),
        sizes: toPandaTokens(sizes),
        durations: toPandaTokens(transitions.duration),
        easings: toPandaTokens(transitions.easing),
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

  // Output directory for generated CSS system
  // Contains all generated types, utilities, and runtime functions
  outdir: "styled-system",

  // JSX Framework configuration
  jsxFramework: "react",

  // Production optimizations
  // v1.7.0: Enhanced optimization with better tree-shaking
  minify: process.env.NODE_ENV === "production", // Minify CSS only in production
  hash: process.env.NODE_ENV === "production", // Hash class names only in production for better debugging in dev
  optimize: true, // Enable all optimizations

  // Logging level for build-time debugging
  // v1.7.0: More granular logging options
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "info",

  // Strict mode for better type safety
  // v1.7.0: Recommended to enable in development for better DX
  strictTokens: false, // Set to true to enforce only design token values
  strictPropertyValues: false, // Set to true to only allow token values for properties

  // v1.7.0: Shorthands configuration
  // Enable/disable CSS property shorthands for better type safety
  shorthands: true,

  // v1.7.0: Enhanced type generation
  emitPackage: false, // Set to true if you want to publish the styled-system as a package

  // Utilities configuration
  // Extend with custom utility functions if needed
  utilities: {
    extend: {
      // Custom utility for text truncation
      truncate: {
        className: "truncate",
        values: { type: "boolean" },
        transform(value) {
          if (!value) return {};
          return {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          };
        },
      },
      // Custom utility for line clamping
      lineClamp: {
        className: "line-clamp",
        values: { type: "number" },
        transform(value) {
          return {
            display: "-webkit-box",
            WebkitLineClamp: String(value),
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          };
        },
      },
    },
  },

  // Patterns configuration
  // Panda patterns are reusable layout primitives
  patterns: {
    extend: {
      // Custom patterns can be added here
      // Example: A custom "stack" pattern with consistent spacing
    },
  },

  // v1.7.0: Import Map for better module resolution
  importMap: {
    css: "@httpjpg/ui/css",
    recipes: "@httpjpg/ui/recipes",
    patterns: "@httpjpg/ui/patterns",
    jsx: "@httpjpg/ui/jsx",
  },
});
