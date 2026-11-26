import { expect, test } from "@playwright/test";

test("home page renders the global shell and Storyblok content", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);

  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();

  const mainHtml = await page.locator("main").innerHTML();
  expect(mainHtml.trim().length).toBeGreaterThan(0);
});

test("the home story's own slug leads to the root", async ({ request }) => {
  const res = await request.get("/home?ref=nav", { maxRedirects: 0 });

  expect(res.status()).toBe(308);
  expect(res.headers().location).toMatch(/\/\?ref=nav$/);
});
