import { expect, type Page, test } from "@playwright/test";

function rootFontSize(page: Page): Promise<number> {
  return page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
  );
}

test.describe("viewport scaling", () => {
  test("a scaled work page is 16px per rem at each band's design width", async ({ page }) => {
    for (const width of [1440, 834, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work/scaled");

      expect(await rootFontSize(page)).toBeCloseTo(16, 0);
    }
  });

  test("it scales like an image between and beyond the design widths", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work/scaled");
    const heading = page.getByRole("heading", { level: 1, name: "Scaled shooting" });
    await expect(heading).toBeVisible();
    const atDesign = await heading.boundingBox();

    await page.setViewportSize({ width: 2880, height: 1800 });

    await expect.poll(() => rootFontSize(page)).toBeCloseTo(32, 0);
    const doubled = await heading.boundingBox();
    expect((doubled?.height ?? 0) / (atDesign?.height ?? 1)).toBeCloseTo(2, 1);

    await page.setViewportSize({ width: 780 - 13, height: 900 });
    await expect.poll(() => rootFontSize(page)).toBeGreaterThan(30);
  });

  test("other pages keep the browser's own root size", async ({ page }) => {
    await page.setViewportSize({ width: 2880, height: 1800 });
    await page.goto("/");

    await expect(page.locator("html")).not.toHaveAttribute("data-page-scale");
    expect(await rootFontSize(page)).toBe(16);
  });

  test("the scale is dropped on a client-side navigation away", async ({ page }) => {
    await page.setViewportSize({ width: 2880, height: 1800 });
    await page.goto("/work/scaled");
    await expect.poll(() => rootFontSize(page)).toBeCloseTo(32, 0);

    await page.locator("header").getByRole("link", { name: /music/i }).first().click();
    await expect(page).toHaveURL(/\/feed$/);

    await expect(page.locator("html")).not.toHaveAttribute("data-page-scale");
    expect(await rootFontSize(page)).toBe(16);
  });
});
