import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, type AliasOptions, type Plugin } from "vitest/config";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const PORTFOLIO_ROOT = r("./apps/portfolio");
const STUDIO_ROOT = r("./apps/studio");

function appAtAlias(): Plugin {
  return {
    name: "app-at-alias",
    enforce: "pre",
    async resolveId(id, importer, options) {
      if (!id.startsWith("@/")) {
        return;
      }
      const fromStudio =
        typeof importer === "string" &&
        importer.includes(`${path.sep}apps${path.sep}studio${path.sep}`);
      const absolute = path.resolve(fromStudio ? STUDIO_ROOT : PORTFOLIO_ROOT, id.slice(2));
      return this.resolve(absolute, importer, { ...options, skipSelf: true });
    },
  };
}

const alias: AliasOptions = [
  {
    find: "@httpjpg/ui/styles.css",
    replacement: r("./packages/ui/styles.css"),
  },
  {
    find: "@httpjpg/ui/tokens",
    replacement: r("./packages/ui/styled-system/tokens"),
  },
  {
    find: "@httpjpg/ui",
    replacement: r("./packages/ui/src"),
  },
  {
    find: "styled-system",
    replacement: r("./packages/ui/styled-system"),
  },
];

export default defineConfig({
  plugins: [appAtAlias(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tools/vitest/setup.ts"],
    include: [
      "packages/*/src/**/*.{test,spec}.{ts,tsx}",
      "packages/*/scripts/**/*.{test,spec}.{ts,tsx}",
      "apps/*/src/**/*.{test,spec}.{ts,tsx}",
      "apps/portfolio/{lib,app,components}/**/*.{test,spec}.{ts,tsx}",
      "apps/studio/{components,lib,app}/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/tests/e2e/**"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json"],
      thresholds: {
        statements: 93,
        branches: 93,
        functions: 93,
        lines: 93,
      },
      include: [
        "packages/*/src/**/*.{js,jsx,ts,tsx,mjs}",
        "packages/*/scripts/**/*.{js,jsx,ts,tsx,mjs}",
        "apps/portfolio/app/**/*.{js,jsx,ts,tsx}",
        "apps/portfolio/components/**/*.{js,jsx,ts,tsx}",
        "apps/portfolio/lib/**/*.{js,jsx,ts,tsx}",
        "apps/studio/{app,components,lib}/**/*.{js,jsx,ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
        "**/dist/**",
        "**/styled-system/**",
        "**/*.recipe.ts",
        "**/index.ts",
        "**/types.ts",
        // CLI bins that boot on import (dotenv + await main / syncX().catch).
        "packages/credentials/scripts/spotify.ts",
        "packages/credentials/scripts/psn.ts",
        "packages/storyblok-sync/scripts/sync-*.ts",
        "packages/storyblok-sync/scripts/validate-schema.ts",
        "packages/storyblok-sync/scripts/cleanup-duplicate-groups.ts",
        "packages/tokens/scripts/generate-css-vars.ts",
        // Rolldown cannot parse this Next entry file (`import type` after a
        // value import), so v8 records it as 0% and tanks the branch total.
        "apps/portfolio/app/layout.tsx",
      ],
    },
  },
  resolve: {
    alias,
  },
});
