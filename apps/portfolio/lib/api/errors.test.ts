// @vitest-environment node
import { NextResponse } from "next/server";

import { API_ERROR, jsonError, jsonUpstream } from "./errors";

describe("jsonError", () => {
  it("returns the machine code and status", async () => {
    const response = jsonError(API_ERROR.notConfigured, 501);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({ error: "not_configured" });
  });

  it("includes an optional message and reason", async () => {
    const response = jsonError(API_ERROR.upstream, 502, {
      message: "Lanyard is down",
      reason: "auth",
    });

    await expect(response.json()).resolves.toEqual({
      error: "upstream_unavailable",
      message: "Lanyard is down",
      reason: "auth",
    });
  });

  it("forwards extra headers", () => {
    const response = jsonError(API_ERROR.internal, 500, {
      headers: { "X-Test": "1" },
    });

    expect(response.headers.get("X-Test")).toBe("1");
  });
});

describe("jsonUpstream", () => {
  it("uses the shared upstream code", async () => {
    const response = jsonUpstream("Weather unavailable", 503);

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "upstream_unavailable",
      message: "Weather unavailable",
    });
  });
});

describe("API_ERROR", () => {
  it("keeps codes stable for clients that switch on them", () => {
    expect(API_ERROR.rateLimited).toBe("rate_limited");
    expect(API_ERROR.aiUnavailable).toBe("ai_unavailable");
  });
});

describe("jsonError response type", () => {
  it("returns a NextResponse", () => {
    expect(jsonError(API_ERROR.forbidden, 403)).toBeInstanceOf(NextResponse);
  });
});
