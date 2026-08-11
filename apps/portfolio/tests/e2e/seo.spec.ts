import { expect, test } from "@playwright/test";

test.describe("seo surface", () => {
  test("home page ships a complete, crawlable metadata head", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    await expect(page).toHaveTitle(/\S/);

    const description = page.locator('head meta[name="description"]');
    await expect(description).toHaveCount(1);
    expect((await description.getAttribute("content"))?.trim().length ?? 0).toBeGreaterThan(10);

    // Open Graph is what link unfurls read; a relative URL breaks every one of them.
    await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    // The locale itself is authored in the CMS; the head must still carry a
    // well-formed one for unfurls to pick a language.
    await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute(
      "content",
      /^[a-z]{2}_[A-Z]{2}$/,
    );
    await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );

    // og:url is optional, but when Next emits it it must be absolute.
    const ogUrl = page.locator('head meta[property="og:url"]');
    if ((await ogUrl.count()) > 0) {
      expect(await ogUrl.getAttribute("content")).toMatch(/^https?:\/\//);
    }
  });

  test("sitemap lists absolute urls and is well-formed xml", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/xml/);

    const body = await res.text();
    expect(body).toMatch(/<urlset[\s>]/);

    const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locations.length).toBeGreaterThan(0);
    for (const location of locations) {
      expect(location).toMatch(/^https?:\/\//);
    }

    // The site root must always be listed, even when Storyblok returns nothing.
    expect(locations.some((location) => new URL(location).pathname === "/")).toBe(true);

    // Internal-only stories must never leak into the public sitemap.
    expect(locations.some((location) => location.includes("/config"))).toBe(false);
  });
});
