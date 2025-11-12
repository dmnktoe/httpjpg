import path from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

// Resolve paths from the storybook working directory
const rootPath = path.resolve(process.cwd(), "../..");
const uiPackagePath = path.resolve(rootPath, "packages/ui/src");
const tokensPath = path.resolve(rootPath, "packages/tokens/src");

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-links",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@httpjpg/ui": uiPackagePath,
          "@httpjpg/tokens": tokensPath,
        },
        preserveSymlinks: false,
      },
      optimizeDeps: {
        include: ["@httpjpg/tokens"],
        exclude: ["@httpjpg/ui"],
      },
      server: {
        fs: {
          allow: [rootPath],
        },
      },
    });
  },
};

export default config;
