import { expect, test } from "@playwright/test";

test.describe("Test Page", () => {
  test("should load and display the main heading", async ({ page }) => {
    await page.goto("/test-page");

    // Check if page loads successfully
    await expect(page).toHaveTitle(/Test Page/i);

    // Check for main content
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Check for h1
    const heading = page.getByRole("heading", { level: 1, name: /Test Page/i });
    await expect(heading).toBeVisible();
  });

  test("should have working navigation", async ({ page }) => {
    await page.goto("/test-page");

    // Check if navigation is present
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/test-page");

    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/test-page");

    await expect(mainContent).toBeVisible();
  });

  test("should load without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/test-page");

    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000);

    // Filter out known/acceptable errors (e.g., third-party scripts)
    const criticalErrors = consoleErrors.filter((error) => {
      return (
        !error.includes("Failed to load resource") &&
        !error.includes("third-party")
      );
    });

    expect(criticalErrors).toHaveLength(0);
  });
});
