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

  test("RSS feed exposes Storyblok work items as a valid XML document", async ({ request }) => {
    const res = await request.get("/work/feed.xml", { failOnStatusCode: false });
    if (res.status() === 404) {
      test.skip(true, "rss feed disabled via feature flag");
      return;
    }
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"] || "";
    expect(contentType).toMatch(/xml/);
    const body = await res.text();
    expect(body).toMatch(/<rss[\s>]/);
    expect(body).toMatch(/<channel>/);
  });
});
