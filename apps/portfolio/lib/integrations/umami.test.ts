// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchUmamiStats, statsWindow } from "./umami";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function statsResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const REQUEST = {
  apiUrl: "https://api.umami.is/v1",
  apiKey: "secret",
  websiteId: "site-1",
  startAt: 1000,
  endAt: 2000,
};

describe("statsWindow", () => {
  it("parses an ISO start date", () => {
    const now = Date.parse("2026-08-08T00:00:00Z");
    expect(statsWindow("2024-01-01", now)).toEqual({
      startAt: Date.parse("2024-01-01"),
      endAt: now,
    });
  });

  it("falls back to the default start for an unparseable date", () => {
    const now = Date.parse("2026-08-08T00:00:00Z");
    expect(statsWindow("not-a-date", now)).toEqual({
      startAt: Date.parse("2024-01-01"),
      endAt: now,
    });
  });

  it("never starts the window after it ends", () => {
    const now = Date.parse("2020-01-01T00:00:00Z");
    expect(statsWindow("2024-01-01", now)).toEqual({ startAt: now, endAt: now });
  });
});

describe("fetchUmamiStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the website stats with the api key header", async () => {
    mockFetch.mockResolvedValueOnce(
      statsResponse({ pageviews: { value: 10 }, visitors: { value: 4 } }),
    );

    await fetchUmamiStats(REQUEST);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.umami.is/v1/websites/site-1/stats?startAt=1000&endAt=2000",
      expect.objectContaining({
        headers: { "x-umami-api-key": "secret", Accept: "application/json" },
      }),
    );
  });

  it("strips a trailing slash from the api url", async () => {
    mockFetch.mockResolvedValueOnce(
      statsResponse({ pageviews: { value: 1 }, visitors: { value: 1 } }),
    );

    await fetchUmamiStats({ ...REQUEST, apiUrl: "https://api.umami.is/v1/" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.umami.is/v1/websites/site-1/stats"),
      expect.anything(),
    );
  });

  it("returns the counts on success", async () => {
    mockFetch.mockResolvedValueOnce(
      statsResponse({
        pageviews: { value: 1234 },
        visitors: { value: 567 },
        visits: { value: 890 },
      }),
    );

    const result = await fetchUmamiStats(REQUEST);

    expect(result).toEqual({ ok: true, stats: { pageviews: 1234, visitors: 567, visits: 890 } });
  });

  it("defaults visits to zero when the metric is missing", async () => {
    mockFetch.mockResolvedValueOnce(
      statsResponse({ pageviews: { value: 3 }, visitors: { value: 2 } }),
    );

    const result = await fetchUmamiStats(REQUEST);

    expect(result).toMatchObject({ ok: true, stats: { visits: 0 } });
  });

  it("fails on a payload without the core metrics", async () => {
    mockFetch.mockResolvedValueOnce(statsResponse({ pageviews: {} }));

    const result = await fetchUmamiStats(REQUEST);

    expect(result).toEqual({ ok: false, status: 502, message: "Malformed Umami response." });
  });

  it("surfaces an unauthorized response", async () => {
    mockFetch.mockResolvedValueOnce(statsResponse("", false, 401));

    const result = await fetchUmamiStats(REQUEST);

    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it("reports a timeout as a 504", async () => {
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));

    const result = await fetchUmamiStats(REQUEST);

    expect(result).toEqual({ ok: false, status: 504, message: "Umami request timed out." });
  });
});
