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

import { GET } from "./route";

function get(url: string): NextRequest {
  return new NextRequest(`http://localhost${url}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  studioAuth.mockReturnValue({ ok: true, token: "tok", spaceId: "123" });
});

describe("GET /api/fetch-story", () => {
  it("requires a slug", async () => {
    const response = await GET(get("/api/fetch-story"));
    expect(response.status).toBe(400);
  });

  it("404s when no story matches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stories: [] }) }),
    );
    const response = await GET(get("/api/fetch-story?slug=missing"));
    expect(response.status).toBe(404);
  });

  it("returns the story detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ stories: [{ id: 9, full_slug: "work/demo" }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ story: { id: 9, full_slug: "work/demo", content: { body: [] } } }),
        }),
    );
    const response = await GET(get("/api/fetch-story?slug=work/demo"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, story: { id: 9 } });
  });

  it("surfaces lookup failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }));
    const response = await GET(get("/api/fetch-story?slug=work/demo"));
    expect(response.status).toBe(502);
  });

  it("404s outside development and surfaces a detail fetch failure", async () => {
    studioAuth.mockReturnValueOnce({ ok: false, status: 404, error: "Not found" });
    expect((await GET(get("/api/fetch-story?slug=x"))).status).toBe(404);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ stories: [{ id: 9, full_slug: "work/demo" }] }),
        })
        .mockResolvedValueOnce({ ok: false, status: 500 }),
    );
    expect((await GET(get("/api/fetch-story?slug=work/demo"))).status).toBe(500);
  });
});
