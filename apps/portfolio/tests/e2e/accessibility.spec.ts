import { expect, test } from "@playwright/test";

test.describe("document accessibility", () => {
  test("home page exposes a sound document outline", async ({ page }) => {
    await page.goto("/");

    // A declared language is what screen readers pick a voice from.
    await expect(page.locator("html")).toHaveAttribute("lang", "de");

    // Exactly one top-level heading: more than one leaves the outline ambiguous.
    await expect(page.locator("h1")).toHaveCount(1);
    expect((await page.locator("h1").textContent())?.trim().length ?? 0).toBeGreaterThan(0);

    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);

    // Every image needs an alt attribute — decorative ones carry an empty string.
    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt).toBe(0);

    // Links must carry a discernible name; an empty one is unusable by voice.
    const namelessLinks = await page.locator("a[href]").evaluateAll(
      (anchors) =>
        anchors.filter((anchor) => {
          const label =
            anchor.getAttribute("aria-label") ||
            anchor.textContent ||
            anchor.querySelector("img")?.getAttribute("alt") ||
            "";
          return label.trim().length === 0;
        }).length,
    );
    expect(namelessLinks).toBe(0);
  });

  test("every internal link in the global chrome resolves without a server error", async ({
    page,
    request,
  }) => {
    await page.goto("/");

    const hrefs = await page
      .locator("header a[href^='/'], footer a[href^='/']")
      .evaluateAll((anchors) =>
        Array.from(
          new Set(
            anchors
              .map((anchor) => anchor.getAttribute("href") ?? "")
              .filter((href) => href.startsWith("/") && !href.startsWith("//")),
          ),
        ),
      );

    expect(hrefs.length).toBeGreaterThan(0);

    const broken: string[] = [];
    for (const href of hrefs) {
      const res = await request.get(href, { failOnStatusCode: false });
      if (res.status() >= 500) {
        broken.push(`${href} → ${res.status()}`);
      }
    }

    expect(broken).toEqual([]);
  });
});
