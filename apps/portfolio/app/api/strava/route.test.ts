// @vitest-environment node

const envObj = vi.hoisted(() => ({
  STRAVA_CLIENT_ID: "id" as string | undefined,
  STRAVA_CLIENT_SECRET: "secret" as string | undefined,
  STRAVA_REFRESH_TOKEN: "refresh" as string | undefined,
}));

vi.mock("@httpjpg/env", () => ({ env: envObj }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, fetchStravaStatus } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  fetchStravaStatus: vi.fn(),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/integrations/strava", () => ({ fetchStravaStatus }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  envObj.STRAVA_CLIENT_ID = "id";
  envObj.STRAVA_CLIENT_SECRET = "secret";
  envObj.STRAVA_REFRESH_TOKEN = "refresh";
  getConfig.mockResolvedValue({ strava_enabled: true });
});

describe("GET /api/strava", () => {
  it("returns the status payload when configured", async () => {
    fetchStravaStatus.mockResolvedValueOnce({
      ok: true,
      status: {
        todayDistanceMeters: 5000,
        todayMovingTimeSeconds: 1800,
        todayCount: 1,
        primaryType: "Run",
        profileUrl: "https://www.strava.com/athletes/1",
        latest: null,
      },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      todayDistanceMeters: 5000,
      primaryType: "Run",
    });
  });

  it("returns 501 when env credentials are missing", async () => {
    envObj.STRAVA_REFRESH_TOKEN = undefined;

    const response = await GET();

    expect(response.status).toBe(501);
    expect(fetchStravaStatus).not.toHaveBeenCalled();
  });

  it("returns 501 when the CMS flag is off", async () => {
    getConfig.mockResolvedValueOnce({ strava_enabled: false });

    const response = await GET();

    expect(response.status).toBe(501);
  });

  it("propagates upstream failures", async () => {
    fetchStravaStatus.mockResolvedValueOnce({ ok: false, status: 503, message: "down" });

    const response = await GET();

    expect(response.status).toBe(503);
  });

  it("reports unexpected errors", async () => {
    fetchStravaStatus.mockRejectedValueOnce(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
