import { expect, type Page, test } from "@playwright/test";

async function dismissConsent(page: Page) {
  await page.getByRole("button", { name: /Reject All/ }).click();
}

async function gotoHomeWithPanel(page: Page) {
  await page.goto("/");
  if ((await page.locator("[data-feed-panel]").count()) === 0) {
    test.skip(true, "feed panel disabled via feature flag");
  }
}

async function showList(page: Page) {
  const list = page.getByRole("button", { name: "[ ☰ list ]" });
  await expect(async () => {
    await list.click();
    await expect(list).toHaveAttribute("aria-pressed", "true", { timeout: 1000 });
  }).toPass();
}

test.describe("feed", () => {
  test("lists the posts newest first, each with its permalink", async ({ page }) => {
    await page.goto("/feed");

    await expect(page.getByRole("heading", { level: 1, name: /feed/ })).toBeVisible();
    await showList(page);
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
    await showList(page);
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

    const frame = page.locator("[data-feed-frame]").first();
    await expect(frame).toBeVisible();
    const box = await frame.boundingBox();

    expect(box).not.toBeNull();
    expect((box?.height ?? 0) / (box?.width ?? 1)).toBeCloseTo(1.25, 1);
  });

  test("a fitted image keeps its whole frame inside the tile", async ({ page }) => {
    await page.goto("/feed");

    const fitted = page.getByAltText("four by three");

    await expect(fitted).toHaveCSS("object-fit", "contain");
  });

  test("an image in the feed opens the post, and the post leads back", async ({ page }) => {
    await page.goto("/feed");

    await page.getByRole("link", { name: "Open the post: four by three" }).click();
    await expect(page).toHaveURL(/\/feed\/20260102-120000-bbbb$/);
    await expect(page.locator("main article:visible")).toHaveCount(1);

    await page.getByRole("link", { name: "[ ← feed ]" }).click();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.locator("main article:visible")).not.toHaveCount(1);
  });

  test("on its own page an image opens the lightbox at its final size", async ({ page }) => {
    await page.goto("/feed/20260102-120000-bbbb");

    const dialog = page.getByRole("dialog");
    await expect(async () => {
      await page.getByRole("button", { name: "Open four by three at full size" }).click();
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass();
    await expect(dialog).toContainText("straight off the dsc-w5");
    const box = await dialog.getByRole("img", { name: "four by three" }).boundingBox();
    expect(box).not.toBeNull();
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(4 / 3, 1);
    expect(box?.width ?? 0).toBeGreaterThan(400);
  });

  test("a carousel shows a dot for each image and slides when dragged", async ({ page }) => {
    await page.goto("/feed");
    await showList(page);
    const carousel = page.locator("[data-feed-frame]").first();
    await expect(carousel).toBeVisible();
    await carousel.evaluate((element) => element.scrollIntoView({ block: "center" }));
    const dots = page.locator("[data-feed-dots]").first().locator("> *");
    await expect(dots).toHaveCount(3);
    await expect(dots.nth(0)).toHaveAttribute("data-active", "true");

    const box = await carousel.boundingBox();
    const y = (box?.y ?? 0) + (box?.height ?? 0) / 2;
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) * 0.8, y);
    await page.mouse.down();
    await page.mouse.move((box?.x ?? 0) + (box?.width ?? 0) * 0.2, y, { steps: 8 });
    await page.mouse.up();

    await expect(dots.nth(1)).toHaveAttribute("data-active", "true");
    await expect(page).toHaveURL(/\/feed$/);
  });

  test("a desktop starts as a grid of tiles and switches to whole posts", async ({ page }) => {
    await page.goto("/feed");
    const grid = page.locator("[data-feed-view]");
    const caption = page.getByText("harbour dump, three frames").last();

    await expect(grid).toHaveAttribute("data-feed-view", "grid");
    await expect(page.getByRole("button", { name: "Like" })).toHaveCount(0);
    await expect(caption).toHaveCSS("opacity", "0");
    await page.locator("main article").first().hover();
    await expect(caption).toHaveCSS("opacity", "1");

    await showList(page);
    const like = page.getByRole("button", { name: "Like" }).first();
    await like.click();
    await expect(like).toHaveAttribute("aria-pressed", "true");
  });

  test("the posts are signed with the author from the config story", async ({ page }) => {
    await page.goto("/feed/20260102-120000-bbbb");

    await expect(page.locator("main article").getByText("httpjpg").first()).toBeVisible();
  });

  test("a post has its own page", async ({ page }) => {
    await page.goto("/feed/20260102-120000-bbbb");

    await expect(page.locator("main article")).toHaveCount(1);
    await expect(page.getByText("straight off the dsc-w5")).toBeVisible();
  });

  test("the panel floats on other pages and leads to the feed", async ({ page }) => {
    await gotoHomeWithPanel(page);
    await dismissConsent(page);
    const panel = page.locator("[data-feed-panel]");

    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("position", "fixed");
    const box = await panel.locator("[data-feed-panel-stage]").boundingBox();
    expect(Math.abs((box?.width ?? 0) - (box?.height ?? 1))).toBeLessThan(2);
    await expect(panel.locator("[data-feed-panel-dots] > *")).toHaveCount(3);
    await expect(panel.locator("[data-feed-panel-caption]")).toHaveText(
      "harbour dump, three frames",
    );

    await panel.getByRole("link", { name: "Open the feed" }).click();
    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.locator("[data-feed-panel]")).toHaveCount(0);
  });

  test("dragging the panel moves it without opening the feed", async ({ page }) => {
    await gotoHomeWithPanel(page);
    await dismissConsent(page);
    const panel = page.locator("[data-feed-panel]");
    await expect(panel).toBeVisible();
    const before = await panel.boundingBox();

    await panel.hover();
    await page.mouse.down();
    await page.mouse.move((before?.x ?? 0) - 200, (before?.y ?? 0) + 200, { steps: 8 });
    await page.mouse.up();

    const after = await panel.boundingBox();
    expect((before?.x ?? 0) - (after?.x ?? 0)).toBeGreaterThan(100);
    await expect(page).toHaveURL(/\/$/);
  });

  test("on a phone the panel is a block above the footer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHomeWithPanel(page);

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

    const edit = await request.patch("/api/feed/posts/20260102-120000-bbbb", {
      data: { images: [] },
      failOnStatusCode: false,
    });
    const remove = await request.delete("/api/feed/posts/20260102-120000-bbbb", {
      headers: { cookie: "httpjpg_feed_session=not-a-session; httpjpg_feed_editor=1" },
      failOnStatusCode: false,
    });
    const signIn = await request.post("/api/feed/session", {
      data: { token: "definitely-not-the-publish-token-0123456789" },
      failOnStatusCode: false,
    });

    for (const res of [publish, sign, session, edit, remove, signIn]) {
      expect([401, 503]).toContain(res.status());
    }
    expect(signIn.headers()["set-cookie"] ?? "").not.toContain("httpjpg_feed_session");
  });

  test("the upload page asks a visitor for the token and stays out of search", async ({ page }) => {
    const response = await page.goto("/feed/upload");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "new post" })).toBeVisible();
    await expect(page.getByLabel("publish token")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByRole("button", { name: "[ publish ]" })).toHaveCount(0);

    await page.goto("/feed");
    await expect(page.getByRole("link", { name: "[ + new post ]" })).toHaveCount(0);
  });
});
