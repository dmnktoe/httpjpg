import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/config/vitest.setup.ts"],
    include: ["packages/*/src/**/*.{test,spec}.{ts,tsx}", "apps/*/src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/tests/e2e/**"],
    css: false,
    coverage: {
      provider: "v8",
      include: [
        "packages/*/src/**/*.{js,jsx,ts,tsx,mjs}",
        "apps/portfolio/app/**/*.{js,jsx,ts,tsx}",
        "apps/portfolio/components/**/*.{js,jsx,ts,tsx}",
        "apps/portfolio/lib/**/*.{js,jsx,ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
        "**/dist/**",
        "**/styled-system/**",
        "**/scripts/**",
        "**/index.ts",
        "**/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": r("./apps/portfolio"),
      "@httpjpg/ui": r("./packages/ui/src"),
      "styled-system": r("./packages/ui/styled-system"),
    },
  },
});
