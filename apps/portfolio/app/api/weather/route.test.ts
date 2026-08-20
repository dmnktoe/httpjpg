// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { WEATHER_LATITUDE: 1, WEATHER_LONGITUDE: 2 },
}));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { fetchWeather, enforceRateLimit } = vi.hoisted(() => ({
  fetchWeather: vi.fn(),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/integrations/weather", () => ({ fetchWeather }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/weather", () => {
  it("returns the weather payload on success", async () => {
    fetchWeather.mockResolvedValueOnce({
      ok: true,
      temperature: 21,
      code: 1,
      emoji: "☀️",
      condition: "Clear",
      isDay: true,
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      temperature: 21,
      condition: "Clear",
      isDay: true,
    });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
  });

  it("propagates the upstream status when the fetch is not ok", async () => {
    fetchWeather.mockResolvedValueOnce({ ok: false, status: 502, message: "bad gateway" });

    const response = await GET(request);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ error: "Weather unavailable" });
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(fetchWeather).not.toHaveBeenCalled();
  });

  it("returns a 500 and reports unexpected errors", async () => {
    fetchWeather.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
