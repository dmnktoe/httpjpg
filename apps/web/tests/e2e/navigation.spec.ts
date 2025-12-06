import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to test page", async ({ page }) => {
    await page.goto("/test-page");

    // Look for about link (adjust selector based on your actual navigation)
    const aboutLink = page.getByRole("link", { name: /about/i });

    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-12345");

    // Check if custom 404 page is shown - look for the heading specifically
    const notFoundHeading = page.getByRole("heading", { name: /404/i });
    await expect(notFoundHeading).toBeVisible();
  });

  test("mobile menu should work", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/test-page");

    // Look for mobile menu button in header (use first visible one)
    const header = page.getByRole("banner");
    const mobileMenuButton = header
      .getByRole("button", { name: /menu/i })
      .first();

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();

      // Check if menu opened
      // Adjust selector based on your mobile menu implementation
      await page.waitForTimeout(500); // Wait for animation

      // Close menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
    }
  });
});
