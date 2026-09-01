// @vitest-environment node
const mockEnv = vi.hoisted(() => ({
  CLOUDFLARE_API_TOKEN: "token" as string | undefined,
  CLOUDFLARE_ZONE_ID: "0123456789abcdef0123456789abcdef" as string | undefined,
}));

const headerState = vi.hoisted(() => ({
  ray: "8a1b2c3d4e5f-FRA" as string | null,
  country: "DE" as string | null,
  isDraft: false,
}));

vi.mock("@httpjpg/env", () => ({ env: mockEnv }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: headerState.isDraft })),
  headers: vi.fn(async () => ({
    get(name: string) {
      const key = name.toLowerCase();
      if (key === "cf-ray") {
        return headerState.ray;
      }
      if (key === "cf-ipcountry") {
        return headerState.country;
      }
      return null;
    },
  })),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { fetchCloudflareAnalytics, enforceRateLimit } = vi.hoisted(() => ({
  fetchCloudflareAnalytics: vi.fn(),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/integrations/cloudflare", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/integrations/cloudflare")>();
  return { ...actual, fetchCloudflareAnalytics };
});
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;
const ZONE_ID = "0123456789abcdef0123456789abcdef";

beforeEach(() => {
  vi.clearAllMocks();
  mockEnv.CLOUDFLARE_API_TOKEN = "token";
  mockEnv.CLOUDFLARE_ZONE_ID = ZONE_ID;
  headerState.ray = "8a1b2c3d4e5f-FRA";
  headerState.country = "DE";
  headerState.isDraft = false;
  enforceRateLimit.mockResolvedValue(null);
  fetchCloudflareAnalytics.mockResolvedValue({
    requests: 1200,
    cachedRequests: 1104,
    threats: 48,
  });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/cloudflare", () => {
  it("returns the visitor colo and yesterday's zone totals", async () => {
    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      colo: "FRA",
      country: "DE",
      threats: 48,
      cachedRatio: 0.92,
    });
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=60");
    expect(fetchCloudflareAnalytics).toHaveBeenCalledWith("token", ZONE_ID);
  });

  it("still 200s with null extras when the request never hit Cloudflare", async () => {
    headerState.ray = null;
    headerState.country = null;
    mockEnv.CLOUDFLARE_API_TOKEN = undefined;

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      colo: null,
      country: null,
      threats: null,
      cachedRatio: null,
    });
    expect(fetchCloudflareAnalytics).not.toHaveBeenCalled();
  });

  it("skips GraphQL when the zone id is not 32 hex chars", async () => {
    mockEnv.CLOUDFLARE_ZONE_ID = "not-a-zone";

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ colo: "FRA", threats: null });
    expect(fetchCloudflareAnalytics).not.toHaveBeenCalled();
  });

  it("keeps the colo when analytics throws", async () => {
    fetchCloudflareAnalytics.mockRejectedValueOnce(new Error("graphql down"));

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      colo: "FRA",
      country: "DE",
      threats: null,
      cachedRatio: null,
    });
    expect(captureServerException).toHaveBeenCalledOnce();
  });

  it("does not store draft responses", async () => {
    headerState.isDraft = true;

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(fetchCloudflareAnalytics).not.toHaveBeenCalled();
  });
});
