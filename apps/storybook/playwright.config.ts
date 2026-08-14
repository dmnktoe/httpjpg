import { defineConfig, devices } from "@playwright/test";

import { STORYBOOK_BASE_URL, STORYBOOK_STATIC_PORT } from "./tests/visual/lib";

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["json", { outputFile: "visual-results.json" }], ["github"]]
    : [["html", { open: "never" }], ["list"]],

  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      maxDiffPixelRatio: 0.0005,
    },
  },

  use: {
    baseURL: STORYBOOK_BASE_URL,
    colorScheme: "light",
    contextOptions: { reducedMotion: "reduce" },
    deviceScaleFactor: 1,
    launchOptions: { chromiumSandbox: false },
    locale: "en-US",
    timezoneId: "UTC",
    trace: "on-first-retry",
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
