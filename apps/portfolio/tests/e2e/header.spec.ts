import { expect, test } from "@playwright/test";

test.describe("header work list expand toggle", () => {
  test("music link lives inside the header intro block", async ({ page }) => {
    await page.goto("/");
    const musicLink = page.locator("header").getByRole("link", { name: /music/i });
    await expect(musicLink).toHaveAttribute("href", "/feed-xml_html");
  });

  test("expanding a work column reveals extras without pushing main content down", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const moreToggle = page
      .locator("header")
      .getByRole("button", { name: /▾ more \(\d+\)/ })
      .first();

    if ((await moreToggle.count()) === 0) {
      test.skip(true, "no header column has more than 5 items in current Storyblok content");
      return;
    }

    const mainBefore = await page.locator("main").boundingBox();
    expect(mainBefore).not.toBeNull();

    await moreToggle.click();

    const lessToggle = page.locator("header").getByRole("button", { name: /▴ less/ });
    await expect(lessToggle).toBeVisible();

    const mainAfter = await page.locator("main").boundingBox();
    expect(mainAfter?.y).toBe(mainBefore?.y);

    await lessToggle.click();
    await expect(lessToggle).toHaveCount(0);

    const mainCollapsed = await page.locator("main").boundingBox();
    expect(mainCollapsed?.y).toBe(mainBefore?.y);
  });
});
