import { expect, test } from "@playwright/test";

test.describe("api contracts", () => {
  test("health endpoint answers with a machine-readable ok", async ({ request }) => {
    const res = await request.get("/api/health");

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/application\/json/);
    await expect(res.json()).resolves.toEqual({ status: "ok" });
  });

  test("revalidate webhook refuses every unauthenticated caller", async ({ request }) => {
    const payload = { action: "published", full_slug: "home" };

    const noSecret = await request.post("/api/revalidate", {
      data: payload,
      failOnStatusCode: false,
    });
    expect(noSecret.status()).toBe(401);
    await expect(noSecret.json()).resolves.toMatchObject({ message: "Invalid secret" });

    const wrongHeader = await request.post("/api/revalidate", {
      data: payload,
      headers: { "webhook-secret": "definitely-not-the-webhook-secret" },
      failOnStatusCode: false,
    });
    expect(wrongHeader.status()).toBe(401);

    const wrongQuery = await request.post("/api/revalidate", {
      data: payload,
      params: { secret: "definitely-not-the-webhook-secret" },
      failOnStatusCode: false,
    });
    expect(wrongQuery.status()).toBe(401);
  });

  test("draft mode cannot be entered without the preview secret", async ({ request }) => {
    const missing = await request.get("/api/draft", { failOnStatusCode: false });
    expect(missing.status()).toBe(400);
    await expect(missing.json()).resolves.toMatchObject({ message: "Missing secret parameter" });

    const wrong = await request.get("/api/draft", {
      params: { secret: "definitely-not-the-preview-secret", slug: "home" },
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    expect(wrong.status()).toBe(401);
    await expect(wrong.json()).resolves.toMatchObject({ message: "Invalid token" });

    // A rejected attempt must not leave a draft-mode cookie behind.
    const cookies = await request.storageState();
    expect(cookies.cookies.some((cookie) => cookie.name === "__prerender_bypass")).toBe(false);
  });
});
