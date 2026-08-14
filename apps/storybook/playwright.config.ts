import { createArgosReporterOptions } from "@argos-ci/playwright/reporter";
import { defineConfig, devices } from "@playwright/test";

import { STORYBOOK_BASE_URL, STORYBOOK_STATIC_PORT } from "./tests/visual/lib";

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

export default defineConfig({
  testDir: "./tests/visual",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    process.env.CI ? ["dot"] : ["list"],
    [
      "@argos-ci/playwright/reporter",
      createArgosReporterOptions({
        uploadToArgos: !!process.env.CI,
      }),
    ],
  ],

  use: {
    baseURL: STORYBOOK_BASE_URL,
    bypassCSP: true,
    colorScheme: "light",
    contextOptions: { reducedMotion: "reduce" },
    deviceScaleFactor: 1,
    locale: "en-US",
    screenshot: "only-on-failure",
    timezoneId: "UTC",
    trace: "on-first-retry",
    launchOptions: {
      args: ["--disable-lcd-text", "--font-render-hinting=none"],
    },
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1, viewport: DESKTOP_VIEWPORT },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        deviceScaleFactor: 1,
        hasTouch: true,
        viewport: MOBILE_VIEWPORT,
      },
    },
  ],

  webServer: {
    command: "node ./tests/visual/static-server.mjs",
    url: `${STORYBOOK_BASE_URL}/index.json`,
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
    env: { STORYBOOK_STATIC_PORT: String(STORYBOOK_STATIC_PORT) },
  },
});
