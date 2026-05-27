import { LazyMotionProvider } from "@httpjpg/ui";
import type { Preview } from "@storybook/react-vite";
import { create } from "storybook/theming/create";

import "@httpjpg/tokens/dist/tokens.css";
import "@httpjpg/ui/styles.css";

const brutalistTheme = create({
  base: "light",

  brandTitle: "httpjpg",
  brandUrl: "https://httpjpg.com",

  fontBase: "Arial, Helvetica, sans-serif",
  fontCode: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

  colorPrimary: "#000000",
  colorSecondary: "#000000",

  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appBorderColor: "#000000",
  appBorderRadius: 0,

  textColor: "#000000",
  textInverseColor: "#ffffff",
  textMutedColor: "#666666",

  barTextColor: "#000000",
  barSelectedColor: "#000000",
  barBg: "#ffffff",

  inputBg: "#ffffff",
  inputBorder: "#000000",
  inputTextColor: "#000000",
  inputBorderRadius: 0,

  buttonBg: "#000000",
  buttonBorder: "#000000",
  booleanBg: "#ffffff",
  booleanSelectedBg: "#000000",
});

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
