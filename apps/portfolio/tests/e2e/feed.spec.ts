import { expect, type Page, test } from "@playwright/test";

/** The consent banner covers the bottom of the viewport on a first visit, the panel with it. */
async function dismissConsent(page: Page) {
  await page.getByRole("button", { name: /Reject All/ }).click();
}

test.describe("feed", () => {
  test("lists the posts newest first, each with its permalink", async ({ page }) => {
    await page.goto("/feed");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("feed");
    const posts = page.locator("main article");
    await expect(posts).toHaveCount(3);
    await expect(posts.nth(0)).toContainText("harbour dump, three frames");
    await expect(posts.nth(0).getByRole("link", { name: "2026-01-03" })).toHaveAttribute(
      "href",
      "/feed/20260103-120000-aaaa",
    );
    await expect(posts.nth(2)).toContainText("fixture mix");
  });

  test("a carousel counts its images and steps through them", async ({ page }) => {
    await page.goto("/feed");
    const carousel = page.locator("main article").first();

    await expect(carousel.getByText("[ 01 / 03 ]")).toBeVisible();
    await carousel.getByRole("button", { name: "Next image" }).click();

    await expect(carousel.getByText("[ 02 / 03 ]")).toBeVisible();
  });

  test("tiles are square on a desktop, whatever the post's format", async ({ page }) => {
    await page.goto("/feed");

    const frame = page.locator("[data-feed-frame]").first();
    await expect(frame).toBeVisible();
    const box = await frame.boundingBox();

    expect(box).not.toBeNull();
    expect(Math.abs((box?.width ?? 0) - (box?.height ?? 1))).toBeLessThan(2);
  });

  test("a phone shows one column in the post's own format", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/feed");

    const box = await page.locator("[data-feed-frame]").first().boundingBox();

    expect(box).not.toBeNull();
    // 4/5 → the frame is a quarter taller than it is wide.
    expect((box?.height ?? 0) / (box?.width ?? 1)).toBeCloseTo(1.25, 1);
  });

  test("a fitted image keeps its whole frame inside the tile", async ({ page }) => {
    await page.goto("/feed");

    const fitted = page.getByAltText("four by three");

    await expect(fitted).toHaveCSS("object-fit", "contain");
  });

  test("an image opens the lightbox with the post's caption", async ({ page }) => {
    await page.goto("/feed");

    await page.getByRole("button", { name: "Open four by three at full size" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("straight off the dsc-w5");
  });

  test("a post has its own page", async ({ page }) => {
    await page.goto("/feed/20260102-120000-bbbb");

    await expect(page.locator("main article")).toHaveCount(1);
    await expect(page.getByText("straight off the dsc-w5")).toBeVisible();
  });

  test("the panel floats on other pages and leads to the feed", async ({ page }) => {
    await page.goto("/");
    await dismissConsent(page);
    const panel = page.locator("[data-feed-panel]");

    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("position", "fixed");
    const box = await panel.boundingBox();
    expect(Math.abs((box?.width ?? 0) - (box?.height ?? 1))).toBeLessThan(2);

    await panel.getByRole("link", { name: "Open the feed" }).click();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.locator("[data-feed-panel]")).toHaveCount(0);
  });

  test("dragging the panel moves it without opening the feed", async ({ page }) => {
    await page.goto("/");
    await dismissConsent(page);
    const panel = page.locator("[data-feed-panel]");
    const before = await panel.boundingBox();

    await panel.hover();
    await page.mouse.down();
    await page.mouse.move((before?.x ?? 0) + 300, (before?.y ?? 0) - 200, { steps: 8 });
    await page.mouse.up();

    const after = await panel.boundingBox();
    expect((after?.x ?? 0) - (before?.x ?? 0)).toBeGreaterThan(100);
    await expect(page).toHaveURL(/\/$/);
  });

  test("on a phone the panel is a block above the footer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const panel = page.locator("[data-feed-panel]");
    await expect(panel).toHaveCSS("position", "static");
    const panelBox = await panel.boundingBox();
    const footerBox = await page.locator("footer").first().boundingBox();
    expect((panelBox?.y ?? 0) + (panelBox?.height ?? 0)).toBeLessThanOrEqual(footerBox?.y ?? 0);
  });

  test("load more is served as JSON", async ({ request }) => {
    const res = await request.get("/api/feed/posts", { params: { page: "1" } });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.posts).toHaveLength(3);
    expect(body).toMatchObject({ page: 1, hasMore: false });
  });

  test("publishing refuses every caller without the token", async ({ request }) => {
    const publish = await request.post("/api/feed/posts", {
      data: { images: [{ assetId: 1 }] },
      failOnStatusCode: false,
    });
    const sign = await request.post("/api/feed/assets", {
      data: { filename: "a.jpg" },
      headers: { authorization: "Bearer definitely-not-the-publish-token" },
      failOnStatusCode: false,
    });
    const session = await request.get("/api/feed/session", { failOnStatusCode: false });

    // 503 where the deployment has no publish token, 401 where it has one.
    for (const res of [publish, sign, session]) {
      expect([401, 503]).toContain(res.status());
    }
  });
});
