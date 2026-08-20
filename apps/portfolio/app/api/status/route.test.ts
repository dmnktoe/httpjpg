// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getWidgetStatus, enforceRateLimit } = vi.hoisted(() => ({
  getWidgetStatus: vi.fn(),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/queries/widget-status", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/queries/widget-status")>()),
  getWidgetStatus,
}));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

const EMPTY = { letterboxd: null, discogs: null, x: null, trophies: null };

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/status", () => {
  it("returns the whole envelope", async () => {
    getWidgetStatus.mockResolvedValueOnce({
      ...EMPTY,
      discogs: { releases: [{ title: "Endtroducing" }] },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      discogs: { releases: [{ title: "Endtroducing" }] },
      x: null,
    });
  });

  it("caches the envelope only briefly, since the loaders hold the upstreams", async () => {
    getWidgetStatus.mockResolvedValueOnce(EMPTY);

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=60");
  });

  it("keeps draft responses out of shared caches", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    getWidgetStatus.mockResolvedValueOnce(EMPTY);

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(getWidgetStatus).not.toHaveBeenCalled();
  });

  it("reports unexpected errors and returns a 500", async () => {
    getWidgetStatus.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
