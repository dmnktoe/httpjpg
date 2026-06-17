import { defineConfig, devices } from "@playwright/test";

/** Port for the local Storyblok fixture server (tests/e2e/storyblok-mock-server.mjs). */
const STORYBLOK_MOCK_PORT = 4000;

/**
 * Playwright E2E Test Configuration
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["html"], ["github"]] : [["html"], ["list"]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    // 	name: "firefox",
    // 	use: { ...devices["Desktop Firefox"] },
    // },

    // {
    // 	name: "webkit",
    // 	use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    // 	name: "Mobile Chrome",
    // 	use: { ...devices["Pixel 5"] },
    // },
    // {
    // 	name: "Mobile Safari",
    // 	use: { ...devices["iPhone 12"] },
    // },
  ],

  /* Start the Storyblok fixture server + app server before the tests.
   * The mock keeps E2E deterministic and free of live CMS data: the app's
   * Storyblok client is pointed at it via STORYBLOK_API_ENDPOINT. */
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
