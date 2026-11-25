// @vitest-environment node
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/feed/auth", () => ({
  authorizeFeedRequest: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/integrations/storyblok-mapi", () => ({
  mapiConfig: vi.fn(),
  signAssetUpload: vi.fn(),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest, NextResponse } from "next/server";

import { authorizeFeedRequest } from "@/lib/feed/auth";
import { mapiConfig, signAssetUpload } from "@/lib/integrations/storyblok-mapi";
import { enforceRateLimit } from "@/lib/rate-limit";

import { POST } from "./route";

const CONFIG = { token: "pat", spaceId: "42" };
const SIGNED = { id: 7, uploadUrl: "https://s3.test/bucket", fields: { key: "f/42/a.jpg" } };

function post(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/feed/assets", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(enforceRateLimit).mockResolvedValue(null);
  vi.mocked(authorizeFeedRequest).mockReturnValue(null);
  vi.mocked(mapiConfig).mockReturnValue(CONFIG);
  vi.mocked(signAssetUpload).mockResolvedValue(SIGNED);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/feed/assets", () => {
  it("signs an upload for the composer", async () => {
    const response = await POST(post({ filename: "dsc0001.jpg", width: 2592, height: 1944 }));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(SIGNED);
    expect(signAssetUpload).toHaveBeenCalledWith(CONFIG, {
      filename: "dsc0001.jpg",
      size: "2592x1944",
    });
  });

  it("returns the rate-limit refusal", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValue(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }) as never,
    );

    expect((await POST(post({ filename: "a.jpg" }))).status).toBe(429);
    expect(signAssetUpload).not.toHaveBeenCalled();
  });

  it("returns the auth refusal", async () => {
    vi.mocked(authorizeFeedRequest).mockReturnValue(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }) as never,
    );

    expect((await POST(post({ filename: "a.jpg" }))).status).toBe(401);
    expect(signAssetUpload).not.toHaveBeenCalled();
  });

  it("answers 503 without management access", async () => {
    vi.mocked(mapiConfig).mockReturnValue(null);

    const response = await POST(post({ filename: "a.jpg" }));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "not_configured" });
  });

  it("rejects a body that is not JSON", async () => {
    const response = await POST(post("{nope"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_json" });
  });

  it("rejects an unsupported file", async () => {
    const response = await POST(post({ filename: "notes.pdf" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "invalid_body" });
  });

  it("reports an upstream failure", async () => {
    const failure = new Error("Storyblok is down");
    vi.mocked(signAssetUpload).mockRejectedValue(failure);

    const response = await POST(post({ filename: "a.jpg" }));

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: "upstream_unavailable" });
    expect(captureServerException).toHaveBeenCalledWith(failure, {
      tags: { route: "feed-assets" },
    });
  });
});
