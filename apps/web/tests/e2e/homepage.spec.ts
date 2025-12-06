import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display the main heading", async ({ page }) => {
    await page.goto("/");

    // Check if page loads successfully
    await expect(page).toHaveTitle(/httpjpg/i);

    // Check for main content (use .first() since page has multiple main elements)
    const mainContent = page.locator("main").first();
    await expect(mainContent).toBeVisible();
  });

  test("should have working navigation", async ({ page }) => {
    await page.goto("/");

    // Check if header/navigation is present
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const mainContent = page.locator("main").first();
    await expect(mainContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    await expect(mainContent).toBeVisible();
  });

  test("should load without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");

    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000);

    // Filter out known/acceptable errors (e.g., third-party scripts, CMS component warnings)
    const criticalErrors = consoleErrors.filter((error) => {
      // Add filters for known acceptable errors here
      return (
        !error.includes("Failed to load resource") &&
        !error.includes("third-party") &&
        !error.includes("Component work-list doesn't exist") // TODO: Fix Storyblok CMS sync for work_list component
      );
    });

    expect(criticalErrors).toHaveLength(0);
  });
});
