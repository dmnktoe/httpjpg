// @vitest-environment node
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { fetchFavicon } = vi.hoisted(() => ({ fetchFavicon: vi.fn() }));
vi.mock("@/lib/integrations/favicon", () => ({ fetchFavicon }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest } from "next/server";

import { GET } from "./route";

function request(query: string): NextRequest {
  return new NextRequest(`https://httpjpg.com/api/favicon${query}`);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/favicon", () => {
  it("streams the resolved icon with a long cache", async () => {
    const body = Uint8Array.from([0x89, 0x50, 0x4e, 0x47]);
    fetchFavicon.mockResolvedValueOnce({
      ok: true,
      body,
      contentType: "image/png",
      source: "https://example.com/icon.png",
    });

    const response = await GET(request("?url=https%3A%2F%2Fexample.com%2F"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=604800");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    await expect(response.arrayBuffer()).resolves.toHaveProperty("byteLength", 4);
  });

  it("passes the requested size through, clamped to a sane range", async () => {
    fetchFavicon.mockResolvedValue({
      ok: true,
      body: Uint8Array.from([1, 2, 3, 4]),
      contentType: "image/png",
      source: "x",
    });

    await GET(request("?url=https%3A%2F%2Fexample.com%2F&sz=32"));
    expect(fetchFavicon).toHaveBeenLastCalledWith("https://example.com/", 32);

    await GET(request("?url=https%3A%2F%2Fexample.com%2F&sz=9999"));
    expect(fetchFavicon).toHaveBeenLastCalledWith("https://example.com/", 256);

    await GET(request("?url=https%3A%2F%2Fexample.com%2F&sz=nope"));
    expect(fetchFavicon).toHaveBeenLastCalledWith("https://example.com/", 16);
  });

  it("answers a miss with a transparent placeholder instead of a broken image", async () => {
    fetchFavicon.mockResolvedValueOnce({ ok: false, status: 404, message: "No favicon found." });

    const response = await GET(request("?url=https%3A%2F%2Fexample.com%2F"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/gif");
    expect(response.headers.get("X-Favicon-Status")).toBe("not-found");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=21600");
  });

  it("rejects a request without a url", async () => {
    const response = await GET(request(""));

    expect(response.status).toBe(400);
    expect(response.headers.get("X-Favicon-Status")).toBe("missing-url");
    expect(fetchFavicon).not.toHaveBeenCalled();
  });

  it("reports unexpected errors and still returns an image", async () => {
    fetchFavicon.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request("?url=https%3A%2F%2Fexample.com%2F"));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Favicon-Status")).toBe("error");
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
