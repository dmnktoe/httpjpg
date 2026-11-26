import { type APIRequestContext, expect, test } from "@playwright/test";

const MOCK_ORIGIN = "http://127.0.0.1:4000";
const REVALIDATE_SECRET = process.env.STORYBLOK_REVALIDATE_SECRET;

async function setWorkList(request: APIRequestContext, state: "up" | "down") {
  await request.get(`${MOCK_ORIGIN}/__mock/work-list?state=${state}`);
  await request.post("/api/revalidate", {
    headers: { "webhook-secret": REVALIDATE_SECRET ?? "" },
    data: { action: "published", full_slug: "work/example" },
  });
}

test.describe("work rss feed", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ request }) => {
    const res = await request.get("/work/feed.xml", { failOnStatusCode: false });
    test.skip(res.status() === 404, "rss feed disabled via feature flag");
  });

  test("exposes Storyblok work items as a valid XML document", async ({ request }) => {
    const res = await request.get("/work/feed.xml");

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"] || "").toMatch(/xml/);
    const body = await res.text();
    expect(body).toMatch(/<rss[\s>]/);
    expect(body).toMatch(/<channel>/);
  });

  test("asks readers to retry when its cache is expired during an outage", async ({ request }) => {
    test.skip(!REVALIDATE_SECRET, "needs STORYBLOK_REVALIDATE_SECRET to expire the cache");

    try {
      await setWorkList(request, "down");
      const res = await request.get("/work/feed.xml", { failOnStatusCode: false });

      expect(res.status()).toBe(503);
      expect(res.headers()["retry-after"]).toBe("300");
    } finally {
      await setWorkList(request, "up");
    }

    const recovered = await request.get("/work/feed.xml");
    expect(recovered.status()).toBe(200);
  });
});
