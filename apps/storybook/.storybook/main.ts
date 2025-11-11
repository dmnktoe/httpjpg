import type { StorybookConfig } from "@storybook/react-vite";
import wyw from "@wyw-in-js/vite";
import path from "path";
import { mergeConfig } from "vite";

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
    // Use process.cwd() to get the workspace root from the storybook app directory
    const rootPath = path.resolve(process.cwd(), "../..");
    const uiPackagePath = path.resolve(rootPath, "packages/ui");
    const tokensPath = path.resolve(rootPath, "packages/tokens/src");

    return mergeConfig(config, {
      plugins: [
        wyw({
          include: ["**/*.{ts,tsx}"],
          exclude: ["**/node_modules/**", "**/.storybook/**", "**/dist/**"],
          babelOptions: {
            presets: [
              [
                "@babel/preset-typescript",
                { isTSX: true, allExtensions: true },
              ],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        }),
      ],
      resolve: {
        alias: {
          "@httpjpg/ui": path.resolve(uiPackagePath, "src"),
          "@httpjpg/tokens": tokensPath,
        },
        preserveSymlinks: false,
      },
      optimizeDeps: {
        include: ["@httpjpg/tokens"],
        exclude: [
          "@httpjpg/ui",
          "@linaria/core",
          "@linaria/react",
          "@wyw-in-js/transform",
        ],
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
