// @vitest-environment node
vi.mock("@httpjpg/env", () => ({ env: { STORYBLOK_REVALIDATE_SECRET: "s3cret" } }));

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
});
