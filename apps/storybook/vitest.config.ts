import path from "node:path";
import { fileURLToPath } from "node:url";

import { argosVitestPlugin } from "@argos-ci/storybook/vitest-plugin";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

function holdOptimizeDepsUntilCrawl() {
  return {
    name: "hold-optimize-deps-until-crawl",
    enforce: "post" as const,
    config() {
      return {
        optimizeDeps: {
          holdUntilCrawlEnd: true,
          include: [
            "@floating-ui/react-dom",
            "@storybook/react-vite",
            "motion/react",
            "swiper/modules",
            "swiper/react",
          ],
        },
      };
    },
  };
}

// More info at: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
          argosVitestPlugin({
            uploadToArgos: !!process.env.CI,
            ignoreUploadFailures: true,
            argosCSS: `
              iframe { visibility: hidden !important; }
              video { visibility: hidden !important; }
            `,
          }),
          holdOptimizeDepsUntilCrawl(),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              launchOptions: {
                args: ["--disable-lcd-text", "--font-render-hinting=none"],
              },
              contextOptions: {
                reducedMotion: "reduce",
              },
            }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
