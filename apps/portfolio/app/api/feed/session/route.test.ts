// @vitest-environment node
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/feed/auth", () => ({
  authorizeFeedRequest: vi.fn().mockReturnValue(null),
}));

import { NextRequest, NextResponse } from "next/server";

import { authorizeFeedRequest } from "@/lib/feed/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

import { GET } from "./route";

const request = new NextRequest("http://localhost/api/feed/session");

beforeEach(() => {
  vi.mocked(enforceRateLimit).mockResolvedValue(null);
  vi.mocked(authorizeFeedRequest).mockReturnValue(null);
});

describe("GET /api/feed/session", () => {
  it("confirms a token that may publish", async () => {
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns the auth refusal", async () => {
    vi.mocked(authorizeFeedRequest).mockReturnValue(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }) as never,
    );

    expect((await GET(request)).status).toBe(401);
  });

  it("returns the rate-limit refusal before checking the token", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValue(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }) as never,
    );
    vi.mocked(authorizeFeedRequest).mockClear();

    expect((await GET(request)).status).toBe(429);
    expect(authorizeFeedRequest).not.toHaveBeenCalled();
  });
});
