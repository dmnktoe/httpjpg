// @vitest-environment node

const { studioAuth } = vi.hoisted(() => ({
  studioAuth: vi.fn(),
}));

vi.mock("@/lib/mapi", () => ({
  studioAuth,
  mapiPath: (spaceId: string, path: string) =>
    `https://mapi.storyblok.com/v1/spaces/${spaceId}${path}`,
  STORYBLOK_MAPI: "https://mapi.storyblok.com/v1",
}));

import { NextRequest } from "next/server";

import { POST } from "./route";

function post(body: unknown, raw?: string): NextRequest {
  return new NextRequest("http://localhost/api/push", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
}

const GRID = { component: "grid" as const, _uid: "new", items: [] };

beforeEach(() => {
  vi.clearAllMocks();
  studioAuth.mockReturnValue({ ok: true, token: "tok", spaceId: "123" });
});

describe("POST /api/push", () => {
  it("rejects invalid JSON and missing fields", async () => {
    const invalid = await POST(
      new NextRequest("http://localhost/api/push", {
        method: "POST",
        body: "not-json",
        headers: { "content-type": "application/json" },
      }),
    );
    expect(invalid.status).toBe(400);

    const missing = await POST(post({ slug: "work/demo" }));
    expect(missing.status).toBe(400);
  });

  it("404s when the slug does not match a story", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stories: [] }) }),
    );
    const response = await POST(post({ slug: "missing", grid: GRID }));
    expect(response.status).toBe(404);
  });

  it("appends a grid onto the story body", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stories: [{ id: 9, full_slug: "work/demo", content: {} }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          story: {
            id: 9,
            full_slug: "work/demo",
            content: { body: [{ component: "headline" }] },
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchImpl);
    const response = await POST(post({ slug: "work/demo", grid: GRID }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      action: "appended",
      index: 1,
    });
    const update = fetchImpl.mock.calls[2] as [string, RequestInit];
    expect(update[1].method).toBe("PUT");
    const sent = JSON.parse(String(update[1].body)) as {
      story: { content: { body: unknown[] } };
    };
    expect(sent.story.content.body).toEqual([{ component: "headline" }, GRID]);
  });

  it("replaces by uid and preserves the existing _uid", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stories: [{ id: 9, full_slug: "work/demo", content: {} }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          story: {
            id: 9,
            full_slug: "work/demo",
            content: { body: [{ component: "grid", _uid: "keep-me" }] },
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchImpl);
    const response = await POST(
      post({ slug: "work/demo", grid: GRID, mode: "replace", replaceUid: "keep-me" }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ action: "replaced", index: 0 });
    const sent = JSON.parse(fetchImpl.mock.calls[2][1].body as string) as {
      story: { content: { body: Array<{ _uid?: string }> } };
    };
    expect(sent.story.content.body[0]._uid).toBe("keep-me");
  });

  it("replaces by index when uid is missing and 400s when neither matches", async () => {
    const story = {
      id: 9,
      full_slug: "work/demo",
      content: { body: [{ component: "grid", _uid: "a" }] },
    };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ stories: [story] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ story }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }),
    );
    const ok = await POST(
      post({ slug: "work/demo", grid: GRID, mode: "replace", replaceIndex: 0 }),
    );
    expect(ok.status).toBe(200);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ stories: [story] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ story }) }),
    );
    const missing = await POST(
      post({ slug: "work/demo", grid: GRID, mode: "replace", replaceUid: "nope" }),
    );
    expect(missing.status).toBe(400);
  });

  it("404s outside development and surfaces lookup / update failures", async () => {
    studioAuth.mockReturnValueOnce({ ok: false, status: 404, error: "Not found" });
    expect((await POST(post({ slug: "x", grid: GRID }))).status).toBe(404);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    expect((await POST(post({ slug: "x", grid: GRID }))).status).toBe(502);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ stories: [{ id: 9, full_slug: "work/demo", content: {} }] }),
        })
        .mockResolvedValueOnce({ ok: false, status: 500 }),
    );
    expect((await POST(post({ slug: "work/demo", grid: GRID }))).status).toBe(500);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ stories: [{ id: 9, full_slug: "work/demo", content: {} }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ story: { id: 9, full_slug: "work/demo", content: { body: [] } } }),
        })
        .mockResolvedValueOnce({ ok: false, status: 409, text: async () => "conflict" }),
    );
    expect((await POST(post({ slug: "work/demo", grid: GRID }))).status).toBe(409);
  });

  it("replaces an entry that has no _uid", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ stories: [{ id: 9, full_slug: "work/demo", content: {} }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            story: { id: 9, full_slug: "work/demo", content: { body: [{ component: "grid" }] } },
          }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }),
    );
    const response = await POST(
      post({ slug: "work/demo", grid: GRID, mode: "replace", replaceIndex: 0 }),
    );
    expect(response.status).toBe(200);
  });
});
