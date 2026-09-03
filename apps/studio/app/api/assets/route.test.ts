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

describe("GET /api/assets", () => {
  it("returns 404 outside development", async () => {
    studioAuth.mockReturnValueOnce({ ok: false, status: 404, error: "Not found" });
    const response = await GET(get("/api/assets"));
    expect(response.status).toBe(404);
  });

  it("lists assets", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ assets: [{ id: 1, filename: "a.jpg" }] }),
    });
    vi.stubGlobal("fetch", fetchImpl);
    const response = await GET(get("/api/assets?search=cover"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, assets: [{ id: 1 }] });
    expect(new URL(String(fetchImpl.mock.calls[0]?.[0])).searchParams.get("search")).toBe("cover");
  });

  it("surfaces a Storyblok failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    const response = await GET(get("/api/assets"));
    expect(response.status).toBe(401);
  });

  it("defaults missing asset arrays and honours pagination", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchImpl);
    const response = await GET(get("/api/assets?page=2&per_page=10"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      assets: [],
      page: 2,
      perPage: 10,
    });
    expect(new URL(String(fetchImpl.mock.calls[0]?.[0])).searchParams.get("page")).toBe("2");
    expect(new URL(String(fetchImpl.mock.calls[0]?.[0])).searchParams.get("per_page")).toBe("10");
  });
});
