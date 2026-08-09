// @vitest-environment node
const { env } = vi.hoisted(() => ({
  env: {
    NEXT_PUBLIC_UMAMI_ID: "site-1",
    UMAMI_API_KEY: "secret",
    UMAMI_API_URL: "https://api.umami.is/v1",
    UMAMI_STATS_SINCE: "2024-01-01",
  } as Record<string, string | undefined>,
}));

vi.mock("@httpjpg/env", () => ({ env }));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { fetchUmamiStats, statsWindow, enforceRateLimit } = vi.hoisted(() => ({
  fetchUmamiStats: vi.fn(),
  statsWindow: vi.fn(() => ({ startAt: 1000, endAt: 2000 })),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/integrations/umami", () => ({ fetchUmamiStats, statsWindow }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  env.NEXT_PUBLIC_UMAMI_ID = "site-1";
  env.UMAMI_API_KEY = "secret";
  statsWindow.mockReturnValue({ startAt: 1000, endAt: 2000 });
  enforceRateLimit.mockResolvedValue(null);
});

describe("GET /api/umami", () => {
  it("returns the stats with the window start", async () => {
    fetchUmamiStats.mockResolvedValueOnce({
      ok: true,
      stats: { pageviews: 1234, visitors: 567, visits: 890 },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      pageviews: 1234,
      visitors: 567,
      visits: 890,
      since: new Date(1000).toISOString(),
    });
  });

  it("caches the response for an hour", async () => {
    fetchUmamiStats.mockResolvedValueOnce({
      ok: true,
      stats: { pageviews: 1, visitors: 1, visits: 1 },
    });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("passes the rate limiter's response straight through", async () => {
    const limited = new Response(null, { status: 429 });
    enforceRateLimit.mockResolvedValueOnce(limited as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(fetchUmamiStats).not.toHaveBeenCalled();
  });

  it("returns 501 when the api key is missing", async () => {
    env.UMAMI_API_KEY = undefined;

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchUmamiStats).not.toHaveBeenCalled();
  });

  it("returns 501 when the website id is missing", async () => {
    env.NEXT_PUBLIC_UMAMI_ID = undefined;

    const response = await GET(request);

    expect(response.status).toBe(501);
  });

  it("propagates the upstream status when Umami rejects the key", async () => {
    fetchUmamiStats.mockResolvedValueOnce({ ok: false, status: 401, message: "unauthorized" });

    const response = await GET(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ message: "unauthorized" });
  });

  it("reports unexpected errors and returns a 500", async () => {
    fetchUmamiStats.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
