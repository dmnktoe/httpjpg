// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchWeather, weatherEmoji } from "./weather";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function weatherResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

describe("weatherEmoji", () => {
  it("maps WMO codes to native emojis", () => {
    expect(weatherEmoji(0)).toBe("☀️");
    expect(weatherEmoji(2)).toBe("⛅");
    expect(weatherEmoji(3)).toBe("☁️");
    expect(weatherEmoji(48)).toBe("🌫️");
    expect(weatherEmoji(63)).toBe("🌧️");
    expect(weatherEmoji(73)).toBe("🌨️");
    expect(weatherEmoji(95)).toBe("⛈️");
  });

  it("falls back for unknown codes", () => {
    expect(weatherEmoji(4)).toBe("🌡️");
  });
});

describe("fetchWeather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the current temperature and emoji", async () => {
    mockFetch.mockResolvedValueOnce(
      weatherResponse({ current: { temperature_2m: 18.4, weather_code: 2 } }),
    );

    const result = await fetchWeather(51.3127, 9.4797);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("latitude=51.3127&longitude=9.4797"),
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(result).toEqual({ ok: true, temperature: 18.4, code: 2, emoji: "⛅" });
  });

  it("surfaces a non-200 response as a failure", async () => {
    mockFetch.mockResolvedValueOnce(weatherResponse("", false, 503));
    const result = await fetchWeather(0, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(503);
    }
  });

  it("fails on a malformed payload", async () => {
    mockFetch.mockResolvedValueOnce(weatherResponse({ current: {} }));
    const result = await fetchWeather(0, 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(502);
    }
  });
});
