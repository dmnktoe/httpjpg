// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchWeather, weatherCondition, weatherEmoji } from "./weather";

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

  it("covers the remaining code ranges", () => {
    expect(weatherEmoji(1)).toBe("⛅");
    expect(weatherEmoji(45)).toBe("🌫️");
    expect(weatherEmoji(51)).toBe("🌦️");
    expect(weatherEmoji(57)).toBe("🌦️");
    expect(weatherEmoji(61)).toBe("🌧️");
    expect(weatherEmoji(71)).toBe("🌨️");
    expect(weatherEmoji(80)).toBe("🌧️");
    expect(weatherEmoji(82)).toBe("🌧️");
    expect(weatherEmoji(85)).toBe("🌨️");
    expect(weatherEmoji(86)).toBe("🌨️");
    expect(weatherEmoji(99)).toBe("⛈️");
  });
});

describe("weatherCondition", () => {
  it("spells out the condition for WMO codes", () => {
    expect(weatherCondition(0)).toBe("clear");
    expect(weatherCondition(2)).toBe("partly cloudy");
    expect(weatherCondition(3)).toBe("overcast");
    expect(weatherCondition(63)).toBe("rain");
    expect(weatherCondition(95)).toBe("thunderstorm");
  });

  it("covers the remaining code ranges", () => {
    expect(weatherCondition(1)).toBe("mainly clear");
    expect(weatherCondition(45)).toBe("fog");
    expect(weatherCondition(48)).toBe("fog");
    expect(weatherCondition(51)).toBe("drizzle");
    expect(weatherCondition(57)).toBe("drizzle");
    expect(weatherCondition(67)).toBe("rain");
    expect(weatherCondition(71)).toBe("snow");
    expect(weatherCondition(77)).toBe("snow");
    expect(weatherCondition(80)).toBe("rain showers");
    expect(weatherCondition(85)).toBe("snow showers");
    expect(weatherCondition(86)).toBe("snow showers");
  });

  it("falls back for unknown codes", () => {
    expect(weatherCondition(4)).toBe("unknown");
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
    expect(result).toEqual({
      ok: true,
      temperature: 18.4,
      code: 2,
      emoji: "⛅",
      condition: "partly cloudy",
    });
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

  it("fails on a payload without a current block", async () => {
    mockFetch.mockResolvedValueOnce(weatherResponse({}));

    const result = await fetchWeather(0, 0);

    expect(result).toMatchObject({ ok: false, status: 502 });
  });

  it("reports a timeout as a 504", async () => {
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));

    const result = await fetchWeather(0, 0);

    expect(result).toEqual({
      ok: false,
      status: 504,
      message: "Weather request timed out.",
    });
  });

  it("re-throws unexpected network errors", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("network down"));

    await expect(fetchWeather(0, 0)).rejects.toThrow("network down");
  });

  it("aborts the request once the timeout elapses", async () => {
    vi.useFakeTimers();
    mockFetch.mockImplementationOnce((_url, init) => {
      const signal = (init as RequestInit).signal as AbortSignal;
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      });
    });

    const pending = fetchWeather(0, 0);
    await vi.advanceTimersByTimeAsync(5000);

    await expect(pending).resolves.toMatchObject({ ok: false, status: 504 });
    vi.useRealTimers();
  });
});
