// @vitest-environment node
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/feed/auth", () => ({
  authorizeFeedRequest: vi.fn().mockReturnValue(null),
  feedPublishToken: vi.fn(),
  feedSessionValue: vi.fn((token: string) => `session-of-${token}`),
  isFeedPublishToken: vi.fn(),
  FEED_SESSION_COOKIE: "httpjpg_feed_session",
  FEED_EDITOR_COOKIE: "httpjpg_feed_editor",
  FEED_SESSION_MAX_AGE: 2_592_000,
}));

import { NextRequest, NextResponse } from "next/server";

import { authorizeFeedRequest, feedPublishToken, isFeedPublishToken } from "@/lib/feed/auth";
import { enforceRateLimit } from "@/lib/rate-limit";

import { DELETE, GET, POST } from "./route";

const TOKEN = "a-publish-token-that-is-long-enough-0001";
const request = new NextRequest("http://localhost/api/feed/session");

function signIn(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/feed/session", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(enforceRateLimit).mockResolvedValue(null);
  vi.mocked(authorizeFeedRequest).mockReturnValue(null);
  vi.mocked(feedPublishToken).mockReturnValue(TOKEN);
  vi.mocked(isFeedPublishToken).mockImplementation((value) => value === TOKEN);
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

describe("POST /api/feed/session", () => {
  it("starts a session for the right token", async () => {
    const response = await POST(signIn({ token: TOKEN }));

    expect(response.status).toBe(200);
    const session = response.cookies.get("httpjpg_feed_session");
    expect(session).toMatchObject({
      value: `session-of-${TOKEN}`,
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 2_592_000,
    });
    const marker = response.cookies.get("httpjpg_feed_editor");
    expect(marker?.value).toBe("1");
    expect(marker?.httpOnly).toBeFalsy();
  });

  it.each([
    ["a wrong token", { token: "nope" }],
    ["no token", {}],
    ["a token that is not text", { token: 12 }],
    ["no object", null],
  ])("refuses %s without setting a cookie", async (_label, body) => {
    const response = await POST(signIn(body));

    expect(response.status).toBe(401);
    expect(response.cookies.get("httpjpg_feed_session")).toBeUndefined();
  });

  it("answers 400 for a body that is not JSON", async () => {
    expect((await POST(signIn("{nope"))).status).toBe(400);
  });

  it("answers 503 when publishing is not configured", async () => {
    vi.mocked(feedPublishToken).mockReturnValue(null);

    expect((await POST(signIn({ token: TOKEN }))).status).toBe(503);
  });

  it("is rate limited", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValue(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }) as never,
    );

    expect((await POST(signIn({ token: TOKEN }))).status).toBe(429);
  });
});

describe("DELETE /api/feed/session", () => {
  it("drops both cookies", async () => {
    const response = await DELETE();

    expect(response.status).toBe(200);
    expect(response.cookies.get("httpjpg_feed_session")?.value).toBe("");
    expect(response.cookies.get("httpjpg_feed_editor")?.value).toBe("");
  });
});
