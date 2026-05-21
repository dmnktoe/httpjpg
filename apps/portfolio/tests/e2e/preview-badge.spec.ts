import { expect, test } from "@playwright/test";

const BADGE_SELECTOR = "a[aria-label$='open external preview']";

test.describe("FloatingPreviewBadge", () => {
  test("home page never renders a preview badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(BADGE_SELECTOR)).toHaveCount(0);
  });

  test("when present on a work page the badge is portaled to <body> and links externally", async ({
    page,
  }) => {
    await page.goto("/");

    const internalWorkLink = page.locator("main").locator("a[href^='/work/']").first();
    if ((await internalWorkLink.count()) === 0) {
      test.skip(true, "no internal work links to traverse");
      return;
    }

    const href = await internalWorkLink.getAttribute("href");
    if (!href) {
      test.skip(true, "internal work link has no href");
      return;
    }

    await page.goto(href);

    const badge = page.locator(BADGE_SELECTOR);
    if ((await badge.count()) === 0) {
      test.skip(true, `no preview badge on ${href}`);
      return;
    }

    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute("target", "_blank");
    await expect(badge).toHaveAttribute("rel", "noopener noreferrer");
    await expect(badge).toHaveAttribute("href", /^https?:\/\//);

    const parentTag = await badge.evaluate((node) => node.parentElement?.tagName ?? "");
    expect(parentTag).toBe("BODY");

    await expect(badge).toContainText("↗");

    const box = await badge.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    if (box && viewport) {
      const badgeCenterX = box.x + box.width / 2;
      expect(Math.abs(badgeCenterX - viewport.width / 2)).toBeLessThan(6);
      expect(viewport.height - (box.y + box.height)).toBeLessThan(viewport.height / 3);
    }
  });
});
