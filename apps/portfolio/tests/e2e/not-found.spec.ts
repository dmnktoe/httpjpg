import { expect, test } from "@playwright/test";

test.describe("not found", () => {
  test("a page without a story answers 404 with the branded screen", async ({ page, request }) => {
    const res = await request.get("/missing-page", { failOnStatusCode: false });
    test.skip(
      res.status() === 200,
      "the proxy only checks published stories in a production build",
    );

    expect(res.status()).toBe(404);

    const response = await page.goto("/missing/deeper/page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
    await expect(page).toHaveTitle(/Not Found/);
  });

  test("an unknown API path answers 404 as JSON, not as a page", async ({ request }) => {
    for (const method of ["get", "post"] as const) {
      const res = await request[method]("/api/no-such-route", { failOnStatusCode: false });

      expect(res.status()).toBe(404);
      expect(res.headers()["content-type"]).toMatch(/application\/json/);
      await expect(res.json()).resolves.toEqual({ error: "not_found" });
    }
  });

  test("pages that exist keep answering 200", async ({ request }) => {
    for (const path of ["/", "/cv", "/de/cv", "/feed", "/cookie-policy", "/work/scaled"]) {
      const res = await request.get(path);

      expect(res.status(), path).toBe(200);
    }
  });
});
