// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/observability", () => ({
  captureWebVital: vi.fn(),
}));

import { captureWebVital } from "@httpjpg/observability";

import { POST } from "./route";

function makeRequest(body: unknown, headers?: Record<string, string>): Request {
  const json = JSON.stringify(body);
  return new Request("http://localhost/api/vitals", {
    method: "POST",
    body: json,
    headers: {
      "Content-Type": "application/json",
      "content-length": String(json.length),
      "user-agent": "TestAgent/1.0",
      ...headers,
    },
  });
}

describe("POST /api/vitals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a valid vital and returns ok", async () => {
    const res = await POST(makeRequest({ name: "LCP", value: 2345.67 }) as never);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(captureWebVital).toHaveBeenCalledWith(
      expect.objectContaining({ name: "LCP", value: 2345.67 }),
    );
  });

  it("passes rating, id, pathname, navigationType, and userAgent", async () => {
    await POST(
      makeRequest({
        name: "CLS",
        value: 0.05,
        rating: "good",
        id: "v1-abc",
        pathname: "/work",
        navigationType: "navigate",
      }) as never,
    );

    expect(captureWebVital).toHaveBeenCalledWith({
      name: "CLS",
      value: 0.05,
      rating: "good",
      id: "v1-abc",
      pathname: "/work",
      navigationType: "navigate",
      userAgent: "TestAgent/1.0",
    });
  });

  it("strips invalid rating", async () => {
    await POST(makeRequest({ name: "FCP", value: 100, rating: "excellent" }) as never);

    expect(captureWebVital).toHaveBeenCalledWith(expect.objectContaining({ rating: undefined }));
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/vitals", {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "application/json", "content-length": "8" },
    });
    const res = await POST(req as never);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_json" });
  });

  it("returns 400 for unknown vital name", async () => {
    const res = await POST(makeRequest({ name: "XYZ", value: 100 }) as never);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_payload" });
  });

  it("returns 400 for non-numeric value", async () => {
    const res = await POST(makeRequest({ name: "LCP", value: "fast" }) as never);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_payload" });
  });

  it("returns 400 for NaN value", async () => {
    const body = '{"name":"LCP","value":NaN}';
    const req = new Request("http://localhost/api/vitals", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "content-length": String(body.length),
      },
    });
    const res = await POST(req as never);

    expect(res.status).toBe(400);
  });

  it("returns 400 for Infinity value", async () => {
    const res = await POST(makeRequest({ name: "LCP", value: Infinity }) as never);

    expect(res.status).toBe(400);
  });

  it("returns 413 for oversized payloads", async () => {
    const largeBody = JSON.stringify({ name: "LCP", value: 100, padding: "x".repeat(5000) });
    const req = new Request("http://localhost/api/vitals", {
      method: "POST",
      body: largeBody,
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as never);

    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "payload_too_large" });
  });

  it("accepts all five vital names", async () => {
    for (const name of ["CLS", "FCP", "LCP", "TTFB", "INP"]) {
      const res = await POST(makeRequest({ name, value: 100 }) as never);
      expect(res.status).toBe(200);
    }
    expect(captureWebVital).toHaveBeenCalledTimes(5);
  });

  it("accepts all three rating values", async () => {
    for (const rating of ["good", "needs-improvement", "poor"]) {
      await POST(makeRequest({ name: "LCP", value: 100, rating }) as never);
    }

    const calls = vi.mocked(captureWebVital).mock.calls;
    expect(calls[0][0].rating).toBe("good");
    expect(calls[1][0].rating).toBe("needs-improvement");
    expect(calls[2][0].rating).toBe("poor");
  });

  it("caps pathname to 500 characters", async () => {
    const longPathname = "/" + "a".repeat(600);
    await POST(makeRequest({ name: "LCP", value: 100, pathname: longPathname }) as never);

    const call = vi.mocked(captureWebVital).mock.calls[0][0];
    expect(call.pathname).toHaveLength(500);
  });

  it("ignores empty string fields", async () => {
    await POST(makeRequest({ name: "LCP", value: 100, id: "", pathname: "" }) as never);

    expect(captureWebVital).toHaveBeenCalledWith(
      expect.objectContaining({ id: undefined, pathname: undefined }),
    );
  });
});
