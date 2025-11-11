import type { Preview } from "@storybook/react";
// Import global CSS custom properties from tokens
import "../../../packages/tokens/dist/tokens.css";

/**
 * Storybook preview configuration
 *
 * Imports global styles (CSS custom properties) for all stories
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#000000" },
      ],
    },
  },
};

export default preview;
