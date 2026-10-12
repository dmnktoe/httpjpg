// @vitest-environment node
const { env, submitIndexNow } = vi.hoisted(() => ({
  env: {
    STORYBLOK_REVALIDATE_SECRET: "s3cret",
    NEXT_PUBLIC_APP_URL: "https://httpjpg.test",
    INDEXNOW_KEY: undefined as string | undefined,
  },
  submitIndexNow: vi.fn(),
}));

vi.mock("@httpjpg/env", () => ({ env }));
vi.mock("@/lib/integrations/indexnow", () => ({ submitIndexNow }));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { CACHE_TAGS } from "@httpjpg/storyblok-next";
import type { NextRequest } from "next/server";

import { POST } from "./route";

function makeRequest(
  body: unknown,
  { secret, querySecret }: { secret?: string; querySecret?: string } = {},
): NextRequest {
  const url = new URL("https://example.com/api/revalidate");
  if (querySecret) {
    url.searchParams.set("secret", querySecret);
  }
  return {
    headers: { get: (name: string) => (name === "webhook-secret" ? (secret ?? null) : null) },
    nextUrl: url,
    json: async () => body,
  } as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  env.INDEXNOW_KEY = undefined;
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/revalidate", () => {
  it("rejects a request without a secret", async () => {
    const response = await POST(makeRequest({ action: "published" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Invalid secret" });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a request with a wrong secret", async () => {
    const response = await POST(makeRequest({ action: "published" }, { secret: "nope" }));

    expect(response.status).toBe(401);
  });

  it("accepts the secret from the query string", async () => {
    const response = await POST(
      makeRequest({ action: "published", full_slug: "about" }, { querySecret: "s3cret" }),
    );

    expect(response.status).toBe(200);
  });

  it("returns 400 when the payload carries no slug", async () => {
    const response = await POST(makeRequest({ action: "published" }, { secret: "s3cret" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "No story slug provided" });
  });

  it("revalidates the story tag, the stories tag and the page path", async () => {
    const response = await POST(
      makeRequest({ action: "published", story: { full_slug: "about" } }, { secret: "s3cret" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      revalidated: true,
      action: "published",
      story: "about",
      paths: ["/about"],
      tags: [CACHE_TAGS.STORY("about"), CACHE_TAGS.STORIES],
    });
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.STORY("about"), { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.STORIES, { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/about");
  });

  it("maps the home slug to the root path", async () => {
    const response = await POST(
      makeRequest({ action: "published", full_slug: "home" }, { secret: "s3cret" }),
    );

    await expect(response.json()).resolves.toMatchObject({ paths: ["/"] });
  });

  it("also revalidates the parent path for nested slugs", async () => {
    const response = await POST(
      makeRequest({ action: "published", full_slug: "work/some-project" }, { secret: "s3cret" }),
    );

    await expect(response.json()).resolves.toMatchObject({
      paths: ["/work/some-project", "/work"],
    });
    expect(revalidatePath).toHaveBeenCalledWith("/work");
  });

  it("revalidates the config tag and the root layout for the config story", async () => {
    const response = await POST(
      makeRequest({ action: "published", full_slug: "config" }, { secret: "s3cret" }),
    );

    await expect(response.json()).resolves.toMatchObject({
      tags: [CACHE_TAGS.STORY("config"), CACHE_TAGS.STORIES, CACHE_TAGS.CONFIG],
      paths: ["/config", "/layout"],
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("revalidates the config tag when the content type is config", async () => {
    const response = await POST(
      makeRequest(
        { action: "published", story: { full_slug: "settings", content_type: "config" } },
        { secret: "s3cret" },
      ),
    );

    await expect(response.json()).resolves.toMatchObject({
      tags: [CACHE_TAGS.STORY("settings"), CACHE_TAGS.STORIES, CACHE_TAGS.CONFIG],
    });
  });

  it("reports unexpected errors and returns a 500", async () => {
    const request = makeRequest({}, { secret: "s3cret" });
    request.json = vi.fn().mockRejectedValue(new Error("bad json"));

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Error revalidating",
      error: "bad json",
    });
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("falls back to a generic message for non-Error throws", async () => {
    const request = makeRequest({}, { secret: "s3cret" });
    request.json = vi.fn().mockRejectedValue("nope");

    const response = await POST(request);

    await expect(response.json()).resolves.toMatchObject({ error: "Unknown error" });
  });

  describe("IndexNow", () => {
    function publish(fullSlug: string) {
      return POST(makeRequest({ action: "published", full_slug: fullSlug }, { secret: "s3cret" }));
    }

    it("stays quiet without a key", async () => {
      const response = await publish("work/x");

      expect(submitIndexNow).not.toHaveBeenCalled();
      expect(await response.json()).not.toHaveProperty("indexNow");
    });

    it("submits the story's public url", async () => {
      env.INDEXNOW_KEY = "abcdef123456";
      submitIndexNow.mockResolvedValueOnce({ ok: true, response: new Response() });

      const response = await publish("work/x");

      expect(submitIndexNow).toHaveBeenCalledWith({
        baseUrl: "https://httpjpg.test",
        key: "abcdef123456",
        urls: ["https://httpjpg.test/work/x"],
      });
      expect((await response.json()).indexNow).toBe("submitted");
    });

    it("submits the root for home and both locales for the CV", async () => {
      env.INDEXNOW_KEY = "abcdef123456";
      submitIndexNow.mockResolvedValue({ ok: true, response: new Response() });

      await publish("home");
      await publish("cv");

      expect(submitIndexNow.mock.calls[0]?.[0].urls).toEqual(["https://httpjpg.test/"]);
      expect(submitIndexNow.mock.calls[1]?.[0].urls).toEqual([
        "https://httpjpg.test/cv",
        "https://httpjpg.test/de/cv",
      ]);
    });

    it("skips the config story", async () => {
      env.INDEXNOW_KEY = "abcdef123456";

      await publish("config");

      expect(submitIndexNow).not.toHaveBeenCalled();
    });

    it("keeps the webhook green when the ping fails", async () => {
      env.INDEXNOW_KEY = "abcdef123456";
      submitIndexNow.mockResolvedValueOnce({ ok: false, status: 403, message: "Status 403." });

      const failed = await publish("work/x");
      expect(failed.status).toBe(200);
      expect((await failed.json()).indexNow).toBe("failed");

      submitIndexNow.mockRejectedValueOnce(new Error("network"));
      const thrown = await publish("work/x");
      expect(thrown.status).toBe(200);
      expect(captureServerException).toHaveBeenCalledWith(expect.any(Error), {
        tags: { route: "revalidate", integration: "indexnow" },
      });
    });
  });
});
