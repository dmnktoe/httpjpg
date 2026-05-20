import { expect, test } from "@playwright/test";

test.describe("storyblok proxy (apps/portfolio/proxy.ts)", () => {
  test("rejects requests with an invalid storyblok preview token", async ({ request }) => {
    const res = await request.get("/", {
      params: {
        "_storyblok_tk[space_id]": "999999",
        "_storyblok_tk[timestamp]": "1",
        "_storyblok_tk[token]": "deadbeef",
      },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toMatchObject({ error: "Invalid Storyblok token" });
  });

  test("sets Content-Security-Policy frame-ancestors header on every page", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const csp = res.headers()["content-security-policy"];
    expect(csp).toContain("frame-ancestors");
    expect(csp).toContain("https://app.storyblok.com");
  });

  test("flags editor sessions with no-store cache headers when _storyblok param is present", async ({
    request,
  }) => {
    const res = await request.get("/", {
      params: { _storyblok: "1" },
      failOnStatusCode: false,
    });
    expect(res.headers()["cache-control"]).toMatch(/no-store/);
  });
});
