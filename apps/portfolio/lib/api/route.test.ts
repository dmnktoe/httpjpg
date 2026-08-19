// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { enforceRateLimit } = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { API_ERROR } from "./errors";
import { jsonOk } from "./json";
import { publicGet, publicPost } from "./route";

const request = new NextRequest("http://localhost/api/example");

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  vi.mocked(draftMode).mockResolvedValue({ isEnabled: false } as never);
});

describe("publicGet", () => {
  it("runs the handler and returns its response", async () => {
    const GET = publicGet("example", async () => jsonOk({ ok: true }));

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("short-circuits when the limiter denies the request", async () => {
    enforceRateLimit.mockResolvedValueOnce(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }),
    );
    const handler = vi.fn();
    const GET = publicGet("example", handler);

    const response = await GET(request);

    expect(response.status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
  });

  it("passes draft mode through to the handler", async () => {
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    const GET = publicGet("example", async ({ isDraft }) => jsonOk({ isDraft }));

    await expect((await GET(request)).json()).resolves.toEqual({ isDraft: true });
  });

  it("skips draft mode when withDraft is false", async () => {
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    const GET = publicGet("example", async ({ isDraft }) => jsonOk({ isDraft }), {
      withDraft: false,
    });

    await expect((await GET(request)).json()).resolves.toEqual({ isDraft: false });
    expect(draftMode).not.toHaveBeenCalled();
  });

  it("reports unexpected errors and returns a 500 envelope", async () => {
    const GET = publicGet("example", async () => {
      throw new Error("boom");
    });

    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: API_ERROR.internal,
      message: "Request failed",
    });
    expect(captureServerException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { route: "example" },
    });
  });
});

describe("publicPost", () => {
  it("wraps POST handlers the same way", async () => {
    const POST = publicPost("example", async ({ request: incoming }) =>
      jsonOk({ method: incoming.method }),
    );

    const response = await POST(
      new NextRequest("http://localhost/api/example", { method: "POST" }),
    );

    await expect(response.json()).resolves.toEqual({ method: "POST" });
  });
});
