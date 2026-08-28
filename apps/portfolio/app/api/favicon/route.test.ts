// @vitest-environment node
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { fetchFavicon, enforceRateLimit } = vi.hoisted(() => ({
  fetchFavicon: vi.fn(),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));
vi.mock("@/lib/integrations/favicon", () => ({ fetchFavicon }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { inflateSync } from "node:zlib";

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest } from "next/server";

import { GET } from "./route";

function request(query: string): NextRequest {
  return new NextRequest(`https://httpjpg.com/api/favicon${query}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
});

describe("GET /api/favicon", () => {
  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request("?url=https%3A%2F%2Fexample.com%2F"));

    expect(response.status).toBe(429);
    expect(fetchFavicon).not.toHaveBeenCalled();
  });

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
    expect(response.headers.get("X-Favicon-Status")).toBe("hit");
    await expect(response.arrayBuffer()).resolves.toHaveProperty("byteLength", 4);
  });

  it("leaves the length and CSP off inert image types", async () => {
    fetchFavicon.mockResolvedValueOnce({
      ok: true,
      body: Uint8Array.from([0x89, 0x50, 0x4e, 0x47]),
      contentType: "image/png",
      source: "x",
    });

    const response = await GET(request("?url=https%3A%2F%2Fexample.com%2F"));

    expect(response.headers.get("Content-Length")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("locks down SVG icons, which would otherwise run as a same-origin document", async () => {
    fetchFavicon.mockResolvedValueOnce({
      ok: true,
      body: new TextEncoder().encode("<svg/>"),
      contentType: "image/svg+xml",
      source: "x",
    });

    const response = await GET(request("?url=https%3A%2F%2Fexample.com%2F"));

    expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
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
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("X-Favicon-Status")).toBe("not-found");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=21600");
  });

  it("serves a placeholder that is actually transparent", async () => {
    fetchFavicon.mockResolvedValueOnce({ ok: false, status: 404, message: "No favicon found." });

    const response = await GET(request("?url=https%3A%2F%2Fexample.com%2F"));
    const png = Buffer.from(await response.arrayBuffer());

    expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
    expect(png[24]).toBe(8);
    expect(png[25]).toBe(6);

    const idat = png.indexOf("IDAT") + 4;
    const scanline = inflateSync(png.subarray(idat, idat + png.readUInt32BE(idat - 8)));
    expect([...scanline]).toEqual([0, 0, 0, 0, 0]);
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
