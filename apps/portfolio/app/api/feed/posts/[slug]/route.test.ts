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
  findStory: vi.fn(),
  getStory: vi.fn(),
  finishAssetUpload: vi.fn(),
  updatePublishedStory: vi.fn(),
  deleteStory: vi.fn(),
  deleteAsset: vi.fn(),
  isAssetUsedElsewhere: vi.fn(),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest, NextResponse } from "next/server";

import { authorizeFeedRequest } from "@/lib/feed/auth";
import {
  deleteAsset,
  deleteStory,
  findStory,
  finishAssetUpload,
  getStory,
  isAssetUsedElsewhere,
  mapiConfig,
  updatePublishedStory,
} from "@/lib/integrations/storyblok-mapi";
import { enforceRateLimit } from "@/lib/rate-limit";

import { DELETE, GET, PATCH } from "./route";

const CONFIG = { token: "pat", spaceId: "42" };
const SLUG = "20261125-153012-a3f9";
const A = "https://a.storyblok.com/f/42/800x800/aaaaaaaaaa/a.jpg";
const B = "https://a.storyblok.com/f/42/800x800/bbbbbbbbbb/b.jpg";

const STORY = {
  id: 12,
  fullSlug: `feed/${SLUG}`,
  name: "harbour",
  content: {
    _uid: "root",
    component: "post",
    caption: "harbour",
    date: "2026-11-25 15:30",
    format: "4/5",
    images: [
      { _uid: "u1", component: "post_image", fit: "cover", image: { id: 1, filename: A } },
      { _uid: "u2", component: "post_image", fit: "cover", image: { id: 2, filename: B } },
    ],
    music: [],
  },
};

function context(slug = SLUG) {
  return { params: Promise.resolve({ slug }) };
}

function request(method: string, body?: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/feed/posts/${SLUG}`, {
    method,
    ...(body === undefined ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
}

const EDIT = {
  caption: "harbour, edited",
  format: "1/1",
  images: [{ uid: "u2", fit: "contain", alt: "ferry" }, { assetId: 9 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(enforceRateLimit).mockResolvedValue(null);
  vi.mocked(authorizeFeedRequest).mockReturnValue(null);
  vi.mocked(mapiConfig).mockReturnValue(CONFIG);
  vi.mocked(findStory).mockResolvedValue({ id: 12, fullSlug: `feed/${SLUG}` });
  vi.mocked(getStory).mockResolvedValue(structuredClone(STORY));
  vi.mocked(finishAssetUpload).mockImplementation(
    async (_config, id) => `https://a.storyblok.com/f/42/800x800/cccccccccc/${id}.jpg`,
  );
  vi.mocked(updatePublishedStory).mockResolvedValue({ id: 12, fullSlug: `feed/${SLUG}` });
  vi.mocked(deleteStory).mockResolvedValue(undefined);
  vi.mocked(deleteAsset).mockResolvedValue(undefined);
  vi.mocked(isAssetUsedElsewhere).mockResolvedValue(false);
});

describe("opening a post", () => {
  it("returns the refusals in order: rate limit, auth, configuration", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValueOnce(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }) as never,
    );
    expect((await GET(request("GET"), context())).status).toBe(429);
    expect(authorizeFeedRequest).not.toHaveBeenCalled();

    vi.mocked(authorizeFeedRequest).mockReturnValueOnce(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }) as never,
    );
    expect((await GET(request("GET"), context())).status).toBe(401);

    vi.mocked(mapiConfig).mockReturnValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(503);
  });

  it("answers 404 for a slug that cannot be one, without asking Storyblok", async () => {
    expect((await GET(request("GET"), context("../config"))).status).toBe(404);
    expect(findStory).not.toHaveBeenCalled();
  });

  it("answers 404 for a missing story and for one that is no post", async () => {
    vi.mocked(findStory).mockResolvedValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(404);

    vi.mocked(getStory).mockResolvedValueOnce({
      ...STORY,
      content: { component: "page" },
    });
    expect((await DELETE(request("DELETE"), context())).status).toBe(404);
    expect(deleteStory).not.toHaveBeenCalled();
  });

  it("answers 502 and reports when Storyblok fails", async () => {
    vi.mocked(findStory).mockRejectedValueOnce(new Error("down"));

    expect((await GET(request("GET"), context())).status).toBe(502);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});

describe("GET /api/feed/posts/[slug]", () => {
  it("returns the post as Storyblok holds it", async () => {
    const response = await GET(request("GET"), context());

    expect(response.status).toBe(200);
    expect(findStory).toHaveBeenCalledWith(CONFIG, `feed/${SLUG}`);
    expect(await response.json()).toMatchObject({
      id: 12,
      slug: `feed/${SLUG}`,
      url: `/feed/${SLUG}`,
      content: { caption: "harbour" },
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("PATCH /api/feed/posts/[slug]", () => {
  it("rewrites the post, finishes new uploads and drops the files it no longer needs", async () => {
    const response = await PATCH(request("PATCH", EDIT), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 12, slug: `feed/${SLUG}`, url: `/feed/${SLUG}` });
    expect(finishAssetUpload).toHaveBeenCalledWith(CONFIG, 9);

    const [, id, story] = vi.mocked(updatePublishedStory).mock.calls[0] as [
      unknown,
      number,
      { name: string; content: Record<string, unknown> },
    ];
    expect(id).toBe(12);
    expect(story.name).toBe("harbour, edited");
    expect(story.content).toMatchObject({
      _uid: "root",
      caption: "harbour, edited",
      format: "1/1",
      date: "2026-11-25 15:30",
    });
    const images = story.content.images as Array<Record<string, unknown>>;
    expect(images[0]).toMatchObject({ _uid: "u2", fit: "contain", alt: "ferry" });
    expect(images[1]).toMatchObject({ fit: "cover", image: { id: 9 } });

    expect(isAssetUsedElsewhere).toHaveBeenCalledWith(CONFIG, A, 12);
    expect(deleteAsset).toHaveBeenCalledWith(CONFIG, 1);
    expect(deleteAsset).toHaveBeenCalledTimes(1);
  });

  it("keeps a dropped file that another story uses, or that could not be checked", async () => {
    vi.mocked(isAssetUsedElsewhere).mockResolvedValueOnce(true);
    await PATCH(request("PATCH", EDIT), context());
    expect(deleteAsset).not.toHaveBeenCalled();

    vi.mocked(isAssetUsedElsewhere).mockRejectedValueOnce(new Error("search down"));
    await PATCH(request("PATCH", EDIT), context());
    expect(deleteAsset).not.toHaveBeenCalled();
  });

  it("answers 400 for a body it cannot read or an image the post does not have", async () => {
    expect((await PATCH(request("PATCH", "{nope"), context())).status).toBe(400);
    expect((await PATCH(request("PATCH", { images: "x" }), context())).status).toBe(400);
    expect((await PATCH(request("PATCH", { images: [{ uid: "ghost" }] }), context())).status).toBe(
      400,
    );
    expect(updatePublishedStory).not.toHaveBeenCalled();
  });

  it("answers 502 when Storyblok rejects the edit, and leaves the files alone", async () => {
    vi.mocked(updatePublishedStory).mockRejectedValueOnce(new Error("422"));

    const response = await PATCH(request("PATCH", EDIT), context());

    expect(response.status).toBe(502);
    expect(deleteAsset).not.toHaveBeenCalled();
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("still answers when a cleanup fails afterwards", async () => {
    vi.mocked(deleteAsset).mockRejectedValueOnce(new Error("locked"));

    expect((await PATCH(request("PATCH", EDIT), context())).status).toBe(200);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});

describe("DELETE /api/feed/posts/[slug]", () => {
  it("deletes the story, then the files only it used", async () => {
    vi.mocked(isAssetUsedElsewhere).mockImplementation(async (_config, filename) => filename === B);
    const order: string[] = [];
    vi.mocked(deleteStory).mockImplementation(async () => {
      order.push("story");
    });
    vi.mocked(deleteAsset).mockImplementation(async () => {
      order.push("asset");
    });

    const response = await DELETE(request("DELETE"), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, assets: 1 });
    expect(deleteStory).toHaveBeenCalledWith(CONFIG, 12);
    expect(deleteAsset).toHaveBeenCalledWith(CONFIG, 1);
    expect(order).toEqual(["story", "asset"]);
  });

  it("answers 502 and keeps the files when the story cannot be deleted", async () => {
    vi.mocked(deleteStory).mockRejectedValueOnce(new Error("nope"));

    expect((await DELETE(request("DELETE"), context())).status).toBe(502);
    expect(deleteAsset).not.toHaveBeenCalled();
  });
});
