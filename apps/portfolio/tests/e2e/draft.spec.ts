import { createHash } from "node:crypto";

import { expect, test } from "@playwright/test";

const DRAFT_TEXT = "httpjpg fixture page: unpublished-note.";
const PREVIEW_TOKEN = process.env.STORYBLOK_PREVIEW_TOKEN;

function signedQuery(previewToken: string): string {
  const spaceId = "4711";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const token = createHash("sha1").update(`${spaceId}:${previewToken}:${timestamp}`).digest("hex");
  const params = new URLSearchParams({
    _storyblok: "1",
    "_storyblok_tk[space_id]": spaceId,
    "_storyblok_tk[timestamp]": timestamp,
    "_storyblok_tk[token]": token,
  });
  return params.toString();
}

test.describe("unpublished content", () => {
  test.beforeEach(async ({ request }) => {
    const res = await request.get("/missing-page", { failOnStatusCode: false });
    test.skip(res.status() === 200 && !process.env.CI, "next dev reads drafts for every request");
  });

  for (const query of ["_draft=1", "_storyblok=1"]) {
    test(`a bare ?${query} does not show a draft`, async ({ page }) => {
      await page.goto(`/unpublished-note?${query}`);

      await expect(page.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
      await expect(page.getByText(DRAFT_TEXT)).toHaveCount(0);
    });
  }

  test("a signature made with another secret is refused", async ({ request }) => {
    const res = await request.get(`/unpublished-note?${signedQuery("not-the-preview-token")}`, {
      failOnStatusCode: false,
    });

    expect(res.status()).toBe(401);
  });

  test("a request Storyblok signed shows the draft", async ({ page }) => {
    test.skip(!PREVIEW_TOKEN, "needs STORYBLOK_PREVIEW_TOKEN to sign the request");

    await page.goto(`/unpublished-note?${signedQuery(PREVIEW_TOKEN ?? "")}`);

    await expect(page.getByText(DRAFT_TEXT)).toBeVisible();
  });
});
