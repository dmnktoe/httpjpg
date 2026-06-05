import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function findBlockingViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
}

test.describe("accessibility (axe-core)", () => {
  test("home page has no critical or serious WCAG violations", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    const blocking = await findBlockingViolations(page);
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });

  test("an internal content page has no critical or serious WCAG violations", async ({ page }) => {
    await page.goto("/");

    const currentPath = new URL(page.url()).pathname;
    const targetLink = page
      .locator(`a[href^="/"]:not([href="${currentPath}"]):not([href^="//"]):not([target="_blank"])`)
      .first();

    if ((await targetLink.count()) === 0) {
      test.skip(true, "no internal nav link to a different path available");
      return;
    }

    await targetLink.click();
    await page.waitForLoadState("networkidle");

    const blocking = await findBlockingViolations(page);
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
});
