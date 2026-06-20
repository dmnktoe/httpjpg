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

import { GET } from "./route";

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
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ temperature: 21, condition: "Clear" });
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
  });

  it("propagates the upstream status when the fetch is not ok", async () => {
    fetchWeather.mockResolvedValueOnce({ ok: false, status: 502, message: "bad gateway" });

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ error: "Weather unavailable" });
  });

  it("returns a 500 and reports unexpected errors", async () => {
    fetchWeather.mockRejectedValueOnce(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
