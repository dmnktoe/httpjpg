import { CMS_OPTIONS } from "@httpjpg/storyblok-utils";
import {
  borderRadius,
  colors,
  opacity,
  shadows,
  sizes,
  spacing,
  transitions,
  typography,
  zIndex,
} from "@httpjpg/tokens";
import { defineConfig } from "@pandacss/dev";

import { hexToRgba, linearGradient } from "./panda.helpers";

const pandaCliProduction = process.env.PANDA_PRODUCTION === "1";

function toPandaTokens<T extends Record<string, any>>(obj: T): Record<string, any> {
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

const gridTemplateColumns = CMS_OPTIONS.gridColumn.map((c) =>
  c === "auto" ? "repeat(auto-fit, minmax(200px, 1fr))" : `repeat(${c}, 1fr)`,
);

const gridColumnValues = CMS_OPTIONS.gridSpan.map((s) => (s === "full" ? "1 / -1" : `span ${s}`));

const headlineClampSizes = [
  "clamp(2.25rem, 5vw + 1rem, 3.75rem)",
  "clamp(1.875rem, 4vw + 1rem, 3rem)",
  "clamp(1.5rem, 3vw + 0.5rem, 2.25rem)",
];

export default defineConfig({
  preflight: true,

  include: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "../../apps/storybook/stories/**/*.{ts,tsx}",
    "../../apps/portfolio/app/**/*.{ts,tsx}",
    "../../apps/portfolio/components/**/*.{ts,tsx}",
    "../../packages/consent/src/**/*.{ts,tsx}",
    "../../packages/storyblok-richtext/src/**/*.{ts,tsx}",
    "../../packages/storyblok-ui/src/**/*.{ts,tsx}",
  ],

  exclude: ["./node_modules/**", "./styled-system/**", "./.next/**", "./dist/**", "./.turbo/**"],

  /**
   * Every CSS property listed here is statically extracted for every value
   * in `CMS_OPTIONS`, in every responsive condition. This is what makes
   * runtime Storyblok values "just work" in the Visual Editor — the class
   * is already in the bundle.
   */
  staticCss: {
    css: [
      {
        conditions: ["md", "lg"],
        properties: {
          color: CMS_OPTIONS.colors,
          backgroundColor: CMS_OPTIONS.colors,
          borderColor: CMS_OPTIONS.colors,
          fontSize: [...CMS_OPTIONS.fontSize, ...headlineClampSizes],
          fontWeight: CMS_OPTIONS.fontWeight,
          fontFamily: CMS_OPTIONS.fontFamily,
          textAlign: CMS_OPTIONS.textAlign,
          alignItems: CMS_OPTIONS.alignItems,
          justifyItems: CMS_OPTIONS.justifyItems,
          justifyContent: CMS_OPTIONS.justifyContent,
          flexDirection: ["row", "column"],
          flexWrap: ["wrap", "nowrap"],
          gap: CMS_OPTIONS.spacing,
          rowGap: CMS_OPTIONS.spacing,
          columnGap: CMS_OPTIONS.spacing,
          margin: CMS_OPTIONS.spacing,
          marginTop: CMS_OPTIONS.spacing,
          marginBottom: CMS_OPTIONS.spacing,
          marginLeft: CMS_OPTIONS.spacing,
          marginRight: CMS_OPTIONS.spacing,
          padding: CMS_OPTIONS.spacing,
          paddingTop: CMS_OPTIONS.spacing,
          paddingBottom: CMS_OPTIONS.spacing,
          paddingLeft: CMS_OPTIONS.spacing,
          paddingRight: CMS_OPTIONS.spacing,
          paddingBlock: CMS_OPTIONS.spacing,
          paddingInline: CMS_OPTIONS.spacing,
          gridTemplateColumns,
          gridColumn: gridColumnValues,
          gridAutoFlow: CMS_OPTIONS.gridFlow,
          aspectRatio: CMS_OPTIONS.aspectRatio,
          borderTopStyle: ["solid", "dashed", "dotted"],
          borderBottomStyle: ["solid", "dashed", "dotted"],
          maxWidth: ["640px", "768px", "1024px", "1280px", "1536px", "100%"],
          width: CMS_OPTIONS.imageWidth,
          borderRadius: Object.keys(borderRadius),
          filter: ["blur(5px)", "blur(8px)", "grayscale(0.5)"],
          background: [
            hexToRgba(colors.primary[500], 0.9),
            hexToRgba(colors.primary[600], 0.95),
            linearGradient("135deg", [
              { hex: colors.accent[400], alpha: 0.9, position: "0%" },
              { hex: colors.accent[600], alpha: 0.9, position: "100%" },
            ]),
            linearGradient("135deg", [
              { hex: colors.accent[400], alpha: 0.95, position: "0%" },
              { hex: colors.accent[600], alpha: 0.95, position: "100%" },
            ]),
            hexToRgba(colors.primary[500], 0.4),
            hexToRgba(colors.primary[600], 0.5),
            hexToRgba(colors.neutral[500], 0.3),
          ],
        },
      },
    ],
  },

  conditions: {
    extend: {
      sm: "@media (min-width: 640px)",
      md: "@media (min-width: 768px)",
      lg: "@media (min-width: 1024px)",
      xl: "@media (min-width: 1280px)",
      "2xl": "@media (min-width: 1536px)",
      dark: "@media (prefers-color-scheme: dark)",
      light: "@media (prefers-color-scheme: light)",
      pageDark: "[data-theme=dark] &",
      hover: "&:is(:hover, [data-hover])",
      focus: "&:is(:focus, [data-focus])",
      focusVisible: "&:is(:focus-visible, [data-focus-visible])",
      active: "&:is(:active, [data-active])",
      disabled: "&:is(:disabled, [data-disabled])",
      motionReduce: "@media (prefers-reduced-motion: reduce)",
      motionSafe: "@media (prefers-reduced-motion: no-preference)",
    },
  },

  globalCss: {
    "*, *::before, *::after": { boxSizing: "border-box" },
    html: {
      lineHeight: 1.5,
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      WebkitTextSizeAdjust: "100%",
    },
    body: {
      fontFamily: "sans",
      fontSize: "sm",
      bg: "pageBg",
      color: "pageFg",
    },
    "img, picture, video, canvas, svg": { display: "block", maxWidth: "100%" },
    "img[data-emoji]": { display: "inline", verticalAlign: "text-top" },
    "input, button, textarea, select": { font: "inherit" },
    "p, h1, h2, h3, h4, h5, h6": { overflowWrap: "break-word" },
    "header a, header button": { pointerEvents: "auto" },
  },

  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        rainbow: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
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
        zIndex: toPandaTokens(zIndex),
        durations: toPandaTokens(transitions.duration),
        easings: toPandaTokens(transitions.easing),
      },
      semanticTokens: {
        colors: {
          pageBg: {
            value: { base: "{colors.white}", _pageDark: "{colors.black}" },
          },
          pageFg: {
            value: { base: "{colors.black}", _pageDark: "{colors.white}" },
          },
          pageMuted: {
            value: { base: "{colors.neutral.700}", _pageDark: "{colors.neutral.300}" },
          },
          pageBorder: {
            value: { base: "{colors.neutral.300}", _pageDark: "{colors.neutral.700}" },
          },
        },
      },
      breakpoints: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      recipes: {
        button: buttonRecipe(),
        navLink: navLinkRecipe(),
        headline: headlineRecipe(),
        paragraph: paragraphRecipe(),
      },
    },
  },

  outdir: "styled-system",
  jsxFramework: "react",
  minify: pandaCliProduction,
  hash: pandaCliProduction,
  optimize: true,
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "info",
  strictTokens: false,
  strictPropertyValues: false,
  shorthands: true,
  emitPackage: false,

  utilities: {
    extend: {
      truncate: {
        className: "truncate",
        values: { type: "boolean" },
        transform: (value) =>
          value
            ? {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }
            : {},
      },
      lineClamp: {
        className: "line-clamp",
        values: { type: "number" },
        transform: (value) => ({
          display: "-webkit-box",
          WebkitLineClamp: String(value),
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }),
      },
    },
  },

  patterns: { extend: {} },

  importMap: {
    css: "@httpjpg/ui/css",
    recipes: "@httpjpg/ui/recipes",
    patterns: "@httpjpg/ui/patterns",
    jsx: "@httpjpg/ui/jsx",
  },
});

function buttonRecipe() {
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
        outline: {
          color: "white",
          _before: {
            background: hexToRgba(colors.primary[500], 0.4),
            filter: "blur(5px)",
            inset: "-3px",
            boxShadow: `0 0 20px 0 ${hexToRgba(colors.primary[500], 0.2)}, 0 0 40px 0 ${hexToRgba(colors.primary[500], 0.1)}`,
          },
          _hover: {
            _before: {
              background: hexToRgba(colors.primary[600], 0.5),
              filter: "blur(5px)",
              boxShadow: `0 0 25px 0 ${hexToRgba(colors.primary[600], 0.3)}, 0 0 45px 0 ${hexToRgba(colors.primary[600], 0.15)}`,
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

function navLinkRecipe() {
  return {
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
        personal: {
          _before: { content: "'🎀 ୧ꔛꗃ˖ '", marginRight: "0.5em" },
        },
        client: {
          _before: { content: "'(^‿^)-𝒷))) '", marginRight: "0.5em" },
        },
      },
    },
    defaultVariants: { variant: "personal" },
  } as const;
}

function headlineRecipe() {
  return {
    className: "headline",
    base: {
      margin: 0,
      padding: 0,
      fontFamily: "headline",
      letterSpacing: "tight",
      lineHeight: 1,
      textWrap: "balance",
    },
    variants: {
      level: {
        1: {
          fontSize: headlineClampSizes[0],
          fontWeight: "black",
          letterSpacing: "tighter",
        },
        2: {
          fontSize: headlineClampSizes[1],
          fontWeight: "extrabold",
          letterSpacing: "tighter",
        },
        3: { fontSize: headlineClampSizes[2], fontWeight: "bold" },
      },
      align: {
        left: { textAlign: "left" },
        center: { textAlign: "center" },
        right: { textAlign: "right" },
        justify: { textAlign: "justify", textJustify: "inter-word", textWrap: "wrap" },
      },
    },
    defaultVariants: { level: 1 },
  } as const;
}

function paragraphRecipe() {
  return {
    className: "paragraph",
    base: {
      margin: 0,
      padding: 0,
      fontFamily: "sans",
      lineHeight: 1.75,
      textWrap: "pretty",
    },
    variants: {
      size: {
        sm: { fontSize: "sm" },
        md: { fontSize: "md" },
        lg: { fontSize: "lg", lineHeight: 1.8 },
        xl: { fontSize: "xl", lineHeight: 1.8 },
      },
      align: {
        left: { textAlign: "left" },
        center: {
          textAlign: "center",
          marginLeft: "auto",
          marginRight: "auto",
        },
        right: { textAlign: "right", marginLeft: "auto" },
        justify: { textAlign: "justify", textJustify: "inter-word" },
      },
      color: {
        default: { color: "black", opacity: 1 },
        muted: { color: "black", opacity: 0.7 },
        dimmed: { color: "black", opacity: 0.5 },
      },
      weight: {
        normal: { fontWeight: 400 },
        medium: { fontWeight: 500 },
        semibold: { fontWeight: 600 },
        bold: { fontWeight: 700 },
      },
      spacing: { true: { marginBottom: 4 } },
    },
    defaultVariants: {
      size: "sm",
      align: "left",
      color: "default",
      weight: "normal",
      spacing: false,
    },
  } as const;
}
