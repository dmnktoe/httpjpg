// @vitest-environment node
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => undefined,
}));
const { env } = vi.hoisted(() => ({
  env: { GITHUB_API_TOKEN: "secret" } as Record<string, string | undefined>,
}));

vi.mock("@httpjpg/env", () => ({ env }));

vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, fetchGithubActivity, isGithubUsername, enforceRateLimit } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  fetchGithubActivity: vi.fn(),
  isGithubUsername: vi.fn(() => true),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));
vi.mock("@/lib/integrations/github", () => ({ fetchGithubActivity, isGithubUsername }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";

import { GET } from "./route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  env.GITHUB_API_TOKEN = "secret";
  isGithubUsername.mockReturnValue(true);
  enforceRateLimit.mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/github", () => {
  it("returns the activity when configured", async () => {
    getConfig.mockResolvedValueOnce({ github_username: "dom" });
    fetchGithubActivity.mockResolvedValueOnce({
      ok: true,
      status: { profile: { login: "dom" }, activity: [] },
    });

    const response = await GET(request);

    expect(fetchGithubActivity).toHaveBeenCalledWith("dom", "secret");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ profile: { login: "dom" }, activity: [] });
  });

  it("caches the response at the edge for fifteen minutes", async () => {
    getConfig.mockResolvedValueOnce({ github_username: "dom" });
    fetchGithubActivity.mockResolvedValueOnce({ ok: true, status: { profile: {}, activity: [] } });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=900");
  });

  it("still loads without a token, which only lifts the rate limit", async () => {
    env.GITHUB_API_TOKEN = undefined;
    getConfig.mockResolvedValueOnce({ github_username: "dom" });
    fetchGithubActivity.mockResolvedValueOnce({ ok: true, status: { profile: {}, activity: [] } });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(fetchGithubActivity).toHaveBeenCalledWith("dom", undefined);
  });

  it("returns 501 when no username is configured", async () => {
    getConfig.mockResolvedValueOnce({});

    const response = await GET(request);

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({ error: "not_configured" });
  });

  it("ignores a malformed username from config", async () => {
    getConfig.mockResolvedValueOnce({ github_username: "../admin" });
    isGithubUsername.mockReturnValue(false);

    const response = await GET(request);

    expect(response.status).toBe(501);
    expect(fetchGithubActivity).not.toHaveBeenCalled();
  });

  it("returns 503 when the config story cannot be read", async () => {
    getConfig.mockResolvedValueOnce(null);

    const response = await GET(request);

    expect(response.status).toBe(503);
  });

  it("propagates an upstream failure", async () => {
    getConfig.mockResolvedValueOnce({ github_username: "dom" });
    fetchGithubActivity.mockResolvedValueOnce({ ok: false, status: 403, message: "bad key" });

    const response = await GET(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ message: "bad key" });
  });

  it("reports unexpected errors and returns a 500", async () => {
    getConfig.mockResolvedValueOnce({ github_username: "dom" });
    fetchGithubActivity.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
