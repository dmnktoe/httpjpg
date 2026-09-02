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

const okAuth = { ok: true as const, token: "tok", spaceId: "123" };

beforeEach(() => {
  vi.clearAllMocks();
  studioAuth.mockReturnValue(okAuth);
});

describe("GET /api/stories", () => {
  it("returns the auth error when studio is locked down", async () => {
    studioAuth.mockReturnValueOnce({ ok: false, status: 404, error: "Not found" });
    const response = await GET(get("/api/stories"));
    expect(response.status).toBe(404);
  });

  it("forwards search and pagination to the Management API", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stories: [{ id: 1, name: "Demo" }], total: 1 }),
    });
    vi.stubGlobal("fetch", fetchImpl);
    const response = await GET(
      get("/api/stories?search=demo&starts_with=work/&page=2&per_page=10"),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, total: 1, page: 2 });
    expect(String(fetchImpl.mock.calls[0][0])).toContain("search_term=demo");
  });

  it("defaults a missing stories array", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const response = await GET(get("/api/stories"));
    await expect(response.json()).resolves.toMatchObject({ ok: true, stories: [], total: 0 });
  });

  it("surfaces a Storyblok failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) }),
    );
    const response = await GET(get("/api/stories"));
    expect(response.status).toBe(502);
  });
});
