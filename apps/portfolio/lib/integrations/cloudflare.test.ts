// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import {
  cachedRatio,
  cloudflareStatusPayload,
  coloFromCfRay,
  edgeFromHeaders,
  fetchCloudflareAnalytics,
  isCloudflareZoneId,
  parseCfCountry,
} from "./cloudflare";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function graphqlResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

describe("coloFromCfRay", () => {
  it("reads the IATA colo off the ray suffix", () => {
    expect(coloFromCfRay("230b030023ae2822-SJC")).toBe("SJC");
    expect(coloFromCfRay("7a3b2c1d0e-fra")).toBe("FRA");
  });

  it("drops missing or malformed rays", () => {
    expect(coloFromCfRay(null)).toBeNull();
    expect(coloFromCfRay("")).toBeNull();
    expect(coloFromCfRay("no-colo-here")).toBeNull();
    expect(coloFromCfRay("230b030023ae2822")).toBeNull();
  });
});

describe("parseCfCountry", () => {
  it("accepts a two-letter country code", () => {
    expect(parseCfCountry("de")).toBe("DE");
    expect(parseCfCountry("US")).toBe("US");
  });

  it("drops Cloudflare's unknown and Tor placeholders", () => {
    expect(parseCfCountry("XX")).toBeNull();
    expect(parseCfCountry("T1")).toBeNull();
    expect(parseCfCountry(null)).toBeNull();
    expect(parseCfCountry("DEU")).toBeNull();
  });
});

describe("cachedRatio", () => {
  it("returns the cached share of requests", () => {
    expect(cachedRatio(100, 92)).toBeCloseTo(0.92);
  });

  it("returns null when there is nothing to ratio", () => {
    expect(cachedRatio(0, 0)).toBeNull();
  });
});

describe("edgeFromHeaders", () => {
  it("reads CF-Ray and CF-IPCountry", () => {
    const headers = new Headers({
      "cf-ray": "230b030023ae2822-FRA",
      "cf-ipcountry": "de",
    });

    expect(edgeFromHeaders(headers)).toEqual({ colo: "FRA", country: "DE" });
  });

  it("returns nulls when the request never hit Cloudflare", () => {
    expect(edgeFromHeaders(new Headers())).toEqual({ colo: null, country: null });
  });
});

describe("cloudflareStatusPayload", () => {
  it("drops zero threats and keeps a cache ratio", () => {
    expect(
      cloudflareStatusPayload(
        { colo: "FRA", country: "DE" },
        { requests: 1200, cachedRequests: 1104, threats: 0 },
      ),
    ).toEqual({
      colo: "FRA",
      country: "DE",
      threats: null,
      cachedRatio: 0.92,
    });
  });

  it("omits analytics fields when the GraphQL read did not land", () => {
    expect(cloudflareStatusPayload({ colo: "SJC", country: null }, null)).toEqual({
      colo: "SJC",
      country: null,
      threats: null,
      cachedRatio: null,
    });
  });
});

describe("isCloudflareZoneId", () => {
  it("accepts a 32-character hex zone id", () => {
    expect(isCloudflareZoneId("0123456789abcdef0123456789abcdef")).toBe(true);
    expect(isCloudflareZoneId("not-a-zone")).toBe(false);
  });
});

describe("fetchCloudflareAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns the latest day that actually had traffic", async () => {
    mockFetch.mockResolvedValueOnce(
      graphqlResponse({
        data: {
          viewer: {
            zones: [
              {
                httpRequests1dGroups: [
                  { sum: { requests: 0, cachedRequests: 0, threats: 0 } },
                  { sum: { requests: 1200, cachedRequests: 1104, threats: 48 } },
                ],
              },
            ],
          },
        },
      }),
    );

    await expect(fetchCloudflareAnalytics("token", "zone")).resolves.toEqual({
      requests: 1200,
      cachedRequests: 1104,
      threats: 48,
    });
  });

  it("collapses GraphQL errors to null so the colo line still renders", async () => {
    mockFetch.mockResolvedValueOnce(graphqlResponse({ errors: [{ message: "zone not found" }] }));

    await expect(fetchCloudflareAnalytics("token", "zone")).resolves.toBeNull();
  });

  it("collapses a non-OK upstream to null", async () => {
    mockFetch.mockResolvedValueOnce(graphqlResponse({}, false, 403));

    await expect(fetchCloudflareAnalytics("token", "zone")).resolves.toBeNull();
  });
});
