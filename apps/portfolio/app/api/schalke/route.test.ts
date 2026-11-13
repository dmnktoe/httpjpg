// @vitest-environment node
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => undefined,
}));
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { enforceRateLimit, fetchSchalkeStatus } = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
  fetchSchalkeStatus: vi.fn(),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/schalke", () => ({ fetchSchalkeStatus }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

const STATUS = {
  fixture: { home: "Hoffenheim", away: "S04", homeGoals: 2, awayGoals: 1, outcome: "loss" },
  standing: { position: 17, previousPosition: 16, trend: "down", points: 6 },
  url: "https://schalke04.de",
};

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/schalke", () => {
  it("returns the fixture and standing without the result flag", async () => {
    fetchSchalkeStatus.mockResolvedValueOnce({ ok: true, ...STATUS });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(STATUS);
  });

  it("caches the response at the edge", async () => {
    fetchSchalkeStatus.mockResolvedValueOnce({ ok: true, ...STATUS });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
  });

  it("keeps draft responses out of shared caches", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    fetchSchalkeStatus.mockResolvedValueOnce({ ok: true, ...STATUS });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("short-circuits when rate limited", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(fetchSchalkeStatus).not.toHaveBeenCalled();
  });

  it("propagates the upstream status when the feed fails", async () => {
    fetchSchalkeStatus.mockResolvedValueOnce({ ok: false, status: 504, message: "timed out" });

    const response = await GET(request);

    expect(response.status).toBe(504);
  });

  it("reports an unexpected throw and answers 500", async () => {
    fetchSchalkeStatus.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalled();
  });
});
