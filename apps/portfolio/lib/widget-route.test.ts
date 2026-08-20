// @vitest-environment node
vi.mock("next/headers", () => ({
  draftMode: vi.fn(async () => ({ isEnabled: false })),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getConfig, enforceRateLimit } = vi.hoisted(() => ({
  getConfig: vi.fn(),
  enforceRateLimit: vi.fn(async (): Promise<Response | null> => null),
}));

vi.mock("@/lib/queries/config", () => ({ getConfig }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit }));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import {
  resolveWidgetSetting,
  settingValue,
  widgetPayload,
  widgetRoute,
  widgetUpstreamError,
} from "./widget-route";

const request = {} as NextRequest;

beforeEach(() => {
  vi.clearAllMocks();
  enforceRateLimit.mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveWidgetSetting", () => {
  it("returns the value when the field is present and valid", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: "user" });

    await expect(
      resolveWidgetSetting({ field: "discogs_username", validate: () => true }),
    ).resolves.toEqual({ status: "ok", value: "user" });
  });

  it("reports an unreadable config story as unavailable, not as missing", async () => {
    getConfig.mockResolvedValueOnce(null);

    await expect(
      resolveWidgetSetting({ field: "discogs_username", validate: () => true }),
    ).resolves.toEqual({ status: "unavailable" });
  });

  it("treats an empty field as missing", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: "" });

    await expect(
      resolveWidgetSetting({ field: "discogs_username", validate: () => true }),
    ).resolves.toEqual({ status: "missing" });
  });

  it("drops a value the validator rejects", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: "../admin" });
    const validate = vi.fn(() => false);

    await expect(resolveWidgetSetting({ field: "discogs_username", validate })).resolves.toEqual({
      status: "missing",
    });
    expect(validate).toHaveBeenCalledWith("../admin");
  });

  it("ignores a non-string field", async () => {
    getConfig.mockResolvedValueOnce({ discogs_username: 42 });

    await expect(
      resolveWidgetSetting({ field: "discogs_username", validate: () => true }),
    ).resolves.toEqual({ status: "missing" });
  });
});

describe("settingValue", () => {
  it("unwraps a resolved setting", () => {
    expect(settingValue({ status: "ok", value: "user" })).toBe("user");
  });

  it("returns undefined for the failure states", () => {
    expect(settingValue({ status: "missing" })).toBeUndefined();
    expect(settingValue({ status: "unavailable" })).toBeUndefined();
  });
});

describe("widgetPayload", () => {
  it("caches public responses at the edge", () => {
    const response = widgetPayload({ ok: true }, { isDraft: false, maxAge: 300 });

    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=300, stale-while-revalidate=600",
    );
  });

  it("keeps draft responses out of shared caches", () => {
    const response = widgetPayload({ ok: true }, { isDraft: true, maxAge: 300 });

    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});

describe("widgetUpstreamError", () => {
  it("propagates the upstream status and message", async () => {
    const response = widgetUpstreamError("Discogs", { status: 404, message: "private" });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Discogs unavailable",
      message: "private",
    });
  });
});

describe("widgetRoute", () => {
  it("passes the handler's response through", async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));

    const response = await widgetRoute({ route: "demo", label: "demo" }, handler)(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith({ isDraft: false });
  });

  it("short-circuits on the rate limiter without running the handler", async () => {
    enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }) as never);
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));

    const response = await widgetRoute({ route: "demo", label: "demo" }, handler)(request);

    expect(response.status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
  });

  it("hands the handler the request's draft mode", async () => {
    const { draftMode } = await import("next/headers");
    vi.mocked(draftMode).mockResolvedValueOnce({ isEnabled: true } as never);
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));

    await widgetRoute({ route: "demo", label: "demo" }, handler)(request);

    expect(handler).toHaveBeenCalledWith({ isDraft: true });
  });

  it("turns an unexpected throw into a reported 500", async () => {
    const handler = vi.fn(async () => {
      throw new Error("boom");
    });

    const response = await widgetRoute({ route: "demo", label: "demo data" }, handler)(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Failed to fetch demo data" });
    expect(captureServerException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { route: "demo" },
    });
  });
});
