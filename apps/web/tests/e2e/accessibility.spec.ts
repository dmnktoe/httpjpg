import { expect, test } from "@playwright/test";

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Check if page has an h1 - use getByRole to find visible heading
    const h1 = page.getByRole("heading", { level: 1 });
    const h1Count = await h1.count();

    // Should have at least one h1 (may have multiple in different sections)
    expect(h1Count).toBeGreaterThan(0);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check each image for alt attribute
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");

        // Alt can be empty string for decorative images, but should exist
        expect(alt).not.toBeNull();
      }
    }
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/");

    // Tab through focusable elements
    await page.keyboard.press("Tab");

    // Check if any element has focus
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should have proper ARIA labels on interactive elements", async ({
    page,
  }) => {
    await page.goto("/");

    // Get all buttons
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);

        // Button should have either text content or aria-label
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute("aria-label");

        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });
});
