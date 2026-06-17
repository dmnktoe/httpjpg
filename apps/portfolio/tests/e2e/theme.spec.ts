import { expect, test } from "@playwright/test";

test.describe("theme attribute", () => {
  test("root <html> ships with a data-theme set to a known value", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).not.toBeNull();
    expect(["light", "dark"]).toContain(theme as string);
  });

  test("data-theme survives a real client-side route transition", async ({ page }) => {
    await page.goto("/");

    const currentPath = new URL(page.url()).pathname;
    const targetLink = page
      .locator(`a[href^="/"]:not([href="${currentPath}"]):not([href^="//"]):not([target="_blank"])`)
      .first();

    if ((await targetLink.count()) === 0) {
      test.skip(true, "no internal nav link to a different path available");
      return;
    }

    const beforeUrl = page.url();
    await targetLink.click();
    await expect(page).not.toHaveURL(beforeUrl);

    await expect(page.locator("html")).toHaveAttribute("data-theme", /^(light|dark)$/);
  });
});
