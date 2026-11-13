import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

const brutalistTheme = create({
  base: "light",

  brandTitle: "HTTPJPG",
  brandUrl: "https://httpjpg.com",
  brandTarget: "_self",

  fontBase: '"Impact", "Haettenschweiler", "Arial Narrow Bold", sans-serif',
  fontCode: 'ui-monospace, "SFMono-Regular", monospace',

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
  barHoverColor: "#000000",

  inputBg: "#ffffff",
  inputBorder: "#000000",
  inputTextColor: "#000000",
  inputBorderRadius: 0,

  buttonBg: "#000000",
  buttonBorder: "#000000",
  booleanBg: "#ffffff",
  booleanSelectedBg: "#000000",

  gridCellSize: 12,
});

addons.setConfig({
  theme: brutalistTheme,
  sidebar: {
    showRoots: false,
    collapsedRoots: [],
  },
});
