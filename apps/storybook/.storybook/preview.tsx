import { LazyMotionProvider } from "@httpjpg/ui";
import type { Preview } from "@storybook/react-vite";
import { create } from "storybook/theming/create";

// Import global CSS custom properties from tokens
import "@httpjpg/tokens/dist/tokens.css";
// Import Panda CSS generated styles
import "@httpjpg/ui/styles.css";

/**
 * Brutalist Black & White Theme with Token-based Typography
 */
const brutalistTheme = create({
  base: "light",

  // Brand
  brandTitle: "httpjpg",
  brandUrl: "https://httpjpg.com",

  // Typography - Using design tokens
  fontBase: "Arial, Helvetica, sans-serif", // Body text uses sans token
  fontCode: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

  // Colors - Pure black & white brutalism
  colorPrimary: "#000000",
  colorSecondary: "#000000",

  // UI
  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appBorderColor: "#000000",
  appBorderRadius: 0,

  // Text colors
  textColor: "#000000",
  textInverseColor: "#ffffff",
  textMutedColor: "#666666",

  // Toolbar
  barTextColor: "#000000",
  barSelectedColor: "#000000",
  barBg: "#ffffff",

  // Form colors
  inputBg: "#ffffff",
  inputBorder: "#000000",
  inputTextColor: "#000000",
  inputBorderRadius: 0,

  // Buttons
  buttonBg: "#000000",
  buttonBorder: "#000000",
  booleanBg: "#ffffff",
  booleanSelectedBg: "#000000",
});

/**
 * Storybook preview configuration
 *
 * Imports global styles (CSS custom properties and Panda CSS) for all stories
 */
const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          ["Colors", "Typography", "Spacing", "Shadows"],
          "Layout",
          "Typography",
          "Navigation",
          "Inputs",
          "Media",
          "Motion",
          "Display",
          "Widgets",
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "white",
      values: [
        { name: "white", value: "#ffffff" },
        { name: "black", value: "#000000" },
      ],
    },
    docs: {
      theme: brutalistTheme,
    },
  },
  decorators: [
    (Story) => (
      <LazyMotionProvider>
        <style>
          {`
            /* Storyblok docs UI only — never bleeds into story content. */
            .sbdocs,
            .sbdocs-content,
            .sbdocs-p,
            .docblock-argstable,
            .docblock-description {
              font-family: Arial, Helvetica, sans-serif;
            }
            .sbdocs-h1,
            .sbdocs-h2,
            .sbdocs-h3,
            .sbdocs-h4,
            .sbdocs-h5,
            .sbdocs-h6,
            .sbdocs-title {
              font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
            }
          `}
        </style>
        <Story />
      </LazyMotionProvider>
    ),
  ],
};

export default preview;
