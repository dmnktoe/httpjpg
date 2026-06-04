import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig, type Plugin, transformWithEsbuild } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve paths from the storybook working directory
const rootPath = path.resolve(process.cwd(), "../..");
const uiPackagePath = path.resolve(rootPath, "packages/ui");
const tokensPackagePath = path.resolve(rootPath, "packages/tokens");
const consentPackagePath = path.resolve(rootPath, "packages/consent");
const portfolioAppPath = path.resolve(rootPath, "apps/portfolio");

// Stories import widgets from the portfolio app, which lives outside Storybook's
// root, so Storybook's own JSX transform skips them. Compile those .tsx files
// with esbuild's tsx loader before they reach the bundler.
function portfolioJsxPlugin(): Plugin {
  return {
    name: "portfolio-jsx",
    enforce: "pre",
    async transform(code, id) {
      if (id.startsWith(portfolioAppPath) && id.endsWith(".tsx")) {
        return transformWithEsbuild(code, id, { loader: "tsx", jsx: "automatic" });
      }
    },
  };
}

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  // Serve the portfolio's public assets so app widgets (e.g. the nostalgia
  // slideshow) can resolve their local image paths.
  staticDirs: [{ from: path.resolve(portfolioAppPath, "public"), to: "/" }],
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
      plugins: [portfolioJsxPlugin()],
      build: {
        target: "esnext",
      },
      resolve: {
        alias: {
          "@httpjpg/ui/styles.css": path.resolve(uiPackagePath, "styles.css"),
          "@httpjpg/ui/tokens": path.resolve(uiPackagePath, "styled-system/tokens"),
          "@httpjpg/ui": path.resolve(uiPackagePath, "src"),
          "@httpjpg/tokens/dist/tokens.css": path.resolve(tokensPackagePath, "dist/tokens.css"),
          "@httpjpg/tokens": path.resolve(tokensPackagePath, "src"),
          "@httpjpg/consent/banner": path.resolve(
            consentPackagePath,
            "src/components/cookie-banner.tsx",
          ),
          "@httpjpg/consent": path.resolve(consentPackagePath, "src"),
          "styled-system": path.resolve(uiPackagePath, "styled-system"),
          // Let stories import portfolio app widgets via the app's own "@/" alias
          "@/": `${portfolioAppPath}/`,
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
