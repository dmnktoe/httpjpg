import { defineConfig, devices } from "@playwright/test";

const STORYBLOK_MOCK_PORT = 4000;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["html"], ["github"]] : [["html"], ["list"]],

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "node ./tests/e2e/storyblok-mock-server.mjs",
      url: `http://127.0.0.1:${STORYBLOK_MOCK_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
      env: { STORYBLOK_MOCK_PORT: String(STORYBLOK_MOCK_PORT) },
    },
    {
      command: process.env.CI ? "pnpm run start" : "pnpm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: { STORYBLOK_API_ENDPOINT: `http://127.0.0.1:${STORYBLOK_MOCK_PORT}/v2` },
    },
  ],
});
