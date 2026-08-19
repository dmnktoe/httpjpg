// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { WEATHER_LATITUDE: 1, WEATHER_LONGITUDE: 2 },
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { fetchWeather } = vi.hoisted(() => ({ fetchWeather: vi.fn() }));

vi.mock("@/lib/integrations/weather", () => ({ fetchWeather }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest } from "next/server";

import { API_ERROR } from "@/lib/api/errors";

import { GET } from "./route";

const request = new NextRequest("http://localhost/api/weather");

beforeEach(() => {
  vi.clearAllMocks();
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
    await expect(response.json()).resolves.toMatchObject({ error: API_ERROR.upstream });
  });

  it("returns a 500 and reports unexpected errors", async () => {
    fetchWeather.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
