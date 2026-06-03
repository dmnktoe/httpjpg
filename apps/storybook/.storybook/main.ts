import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve paths from the storybook working directory
const rootPath = path.resolve(process.cwd(), "../..");
const uiPackagePath = path.resolve(rootPath, "packages/ui");
const tokensPackagePath = path.resolve(rootPath, "packages/tokens");
const consentPackagePath = path.resolve(rootPath, "packages/consent");

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-links"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      build: {
        target: "esnext",
      },
      resolve: {
        alias: {
          "@httpjpg/ui/styles.css": path.resolve(uiPackagePath, "styles.css"),
          "@httpjpg/ui": path.resolve(uiPackagePath, "src"),
          "@httpjpg/tokens/dist/tokens.css": path.resolve(tokensPackagePath, "dist/tokens.css"),
          "@httpjpg/tokens": path.resolve(tokensPackagePath, "src"),
          "@httpjpg/consent/banner": path.resolve(
            consentPackagePath,
            "src/components/cookie-banner.tsx",
          ),
          "@httpjpg/consent": path.resolve(consentPackagePath, "src"),
          "styled-system": path.resolve(uiPackagePath, "styled-system"),
          // Mock Next.js Link for Storybook
          "next/link": path.resolve(__dirname, "next-link-mock.tsx"),
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
