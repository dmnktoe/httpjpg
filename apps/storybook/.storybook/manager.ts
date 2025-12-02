import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

/**
 * Brutalist Black & White Theme for Storybook Manager (Sidebar)
 * Pure brutalism with Impact typography
 */
const brutalistTheme = create({
  base: "light",

  // Brand
  brandTitle: "HTTPJPG",
  brandUrl: "https://httpjpg.com",
  brandTarget: "_self",

  // Typography - Impact everywhere
  fontBase: '"Impact", "Haettenschweiler", "Arial Narrow Bold", sans-serif',
  fontCode: 'ui-monospace, "SFMono-Regular", monospace',

  // Colors - Pure black & white brutalism
  colorPrimary: "#000000",
  colorSecondary: "#000000",

  // UI Background
  appBg: "#ffffff",
  appContentBg: "#ffffff",
  appBorderColor: "#000000",
  appBorderRadius: 0,

  // Text colors
  textColor: "#000000",
  textInverseColor: "#ffffff",
  textMutedColor: "#666666",

  // Toolbar/Sidebar
  barTextColor: "#000000",
  barSelectedColor: "#000000",
  barBg: "#ffffff",
  barHoverColor: "#000000",

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

  // Grid colors
  gridCellSize: 12,
});

addons.setConfig({
  theme: brutalistTheme,
  sidebar: {
    showRoots: false,
    collapsedRoots: [],
  },
});
