// @vitest-environment node
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/feed/auth", () => ({
  authorizeFeedRequest: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/integrations/storyblok-mapi", () => ({
  mapiConfig: vi.fn(),
  finishAssetUpload: vi.fn(),
  ensureFolder: vi.fn(),
  createPublishedStory: vi.fn(),
}));

vi.mock("@/lib/queries/feed", () => ({
  getFeedPage: vi.fn(),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest, NextResponse } from "next/server";

import { authorizeFeedRequest } from "@/lib/feed/auth";
import {
  createPublishedStory,
  ensureFolder,
  finishAssetUpload,
  mapiConfig,
} from "@/lib/integrations/storyblok-mapi";
import { getFeedPage } from "@/lib/queries/feed";
import { enforceRateLimit } from "@/lib/rate-limit";

import { GET, POST } from "./route";

const CONFIG = { token: "pat", spaceId: "42" };

function get(query = ""): NextRequest {
  return new NextRequest(`http://localhost/api/feed/posts${query}`);
}

function post(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/feed/posts", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(enforceRateLimit).mockResolvedValue(null);
  vi.mocked(authorizeFeedRequest).mockReturnValue(null);
  vi.mocked(mapiConfig).mockReturnValue(CONFIG);
  vi.mocked(finishAssetUpload).mockImplementation(
    async (_config, id) => `https://a.storyblok.com/f/42/800x800/abc/${id}.jpg`,
  );
  vi.mocked(ensureFolder).mockResolvedValue(4);
  vi.mocked(createPublishedStory).mockResolvedValue({
    id: 12,
    fullSlug: "feed/20261125-153012-a3f9",
  });
  vi.mocked(getFeedPage).mockResolvedValue({ posts: [], page: 1, hasMore: false });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/feed/posts", () => {
  it("serves the first page by default, publicly cacheable", async () => {
    const response = await GET(get());

    expect(getFeedPage).toHaveBeenCalledWith(1);
    expect(await response.json()).toEqual({ posts: [], page: 1, hasMore: false });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=60");
  });

  it.each([
    ["?page=3", 3],
    ["?page=0", 1],
    ["?page=abc", 1],
    ["?page=99999", 500],
  ])("reads %s as page %i", async (query, page) => {
    await GET(get(query));

    expect(getFeedPage).toHaveBeenCalledWith(page);
  });

  it("needs no token", async () => {
    await GET(get());

    expect(authorizeFeedRequest).not.toHaveBeenCalled();
  });

  it("returns the rate-limit refusal", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValue(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }) as never,
    );

    expect((await GET(get())).status).toBe(429);
    expect(getFeedPage).not.toHaveBeenCalled();
  });
});

describe("POST /api/feed/posts", () => {
  it("finishes the uploads, then creates and publishes the post in the feed folder", async () => {
    const response = await POST(
      post({
        caption: "harbour",
        format: "4/5",
        images: [{ assetId: 7 }, { assetId: 8, fit: "contain" }],
        date: "2026-11-25T15:30:12Z",
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: 12,
      slug: "feed/20261125-153012-a3f9",
      url: "/feed/20261125-153012-a3f9",
    });
    expect(finishAssetUpload).toHaveBeenCalledTimes(2);
    expect(ensureFolder).toHaveBeenCalledWith(CONFIG, { slug: "feed", name: "Feed" });
    expect(createPublishedStory).toHaveBeenCalledWith(
      CONFIG,
      expect.objectContaining({
        name: "harbour",
        slug: expect.stringMatching(/^20261125-153012-[0-9a-f]{4}$/),
        parentId: 4,
        content: expect.objectContaining({
          component: "post",
          caption: "harbour",
          date: "2026-11-25 15:30",
          format: "4/5",
          images: [
            expect.objectContaining({
              fit: "cover",
              image: expect.objectContaining({
                id: 7,
                filename: "https://a.storyblok.com/f/42/800x800/abc/7.jpg",
              }),
            }),
            expect.objectContaining({ fit: "contain" }),
          ],
        }),
      }),
    );
  });

  it("dates an undated post now", async () => {
    await POST(post({ images: [{ assetId: 7 }] }));

    const story = vi.mocked(createPublishedStory).mock.calls[0]?.[1];
    expect(story?.content.date).toBe(new Date().toISOString().slice(0, 16).replace("T", " "));
  });

  it("returns the rate-limit refusal", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValue(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }) as never,
    );

    expect((await POST(post({ images: [{ assetId: 7 }] }))).status).toBe(429);
    expect(createPublishedStory).not.toHaveBeenCalled();
  });

  it("returns the auth refusal", async () => {
    vi.mocked(authorizeFeedRequest).mockReturnValue(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }) as never,
    );

    expect((await POST(post({ images: [{ assetId: 7 }] }))).status).toBe(401);
    expect(createPublishedStory).not.toHaveBeenCalled();
  });

  it("answers 503 without management access", async () => {
    vi.mocked(mapiConfig).mockReturnValue(null);

    const response = await POST(post({ images: [{ assetId: 7 }] }));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "not_configured" });
  });

  it("rejects a body that is not JSON", async () => {
    const response = await POST(post("{nope"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_json" });
  });

  it("rejects an empty post without touching Storyblok", async () => {
    const response = await POST(post({ caption: "words only" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "invalid_body" });
    expect(finishAssetUpload).not.toHaveBeenCalled();
  });

  it("reports an upstream failure and creates nothing", async () => {
    const failure = new Error("asset 7 has no file");
    vi.mocked(finishAssetUpload).mockRejectedValue(failure);

    const response = await POST(post({ images: [{ assetId: 7 }] }));

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: "upstream_unavailable" });
    expect(createPublishedStory).not.toHaveBeenCalled();
    expect(captureServerException).toHaveBeenCalledWith(failure, { tags: { route: "feed-posts" } });
  });
});
