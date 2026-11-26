import { expect, test } from "@playwright/test";

test.describe("storyblok rendering", () => {
  test("home page renders meaningful text content inside <main>", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    const main = page.locator("main");
    await expect(main).toBeVisible();
    const text = (await main.textContent())?.trim() ?? "";
    expect(text.length).toBeGreaterThan(20);
  });

  test("body resets default margin (brutalist shell ships with margin: 0)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveCSS("margin", "0px");
  });
});
