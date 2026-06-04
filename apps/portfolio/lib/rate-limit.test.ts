// @vitest-environment node

import type { NextRequest } from "next/server";
import { beforeEach, vi } from "vitest";

const { mockProtect, arcjetDefault, envObj } = vi.hoisted(() => ({
  mockProtect: vi.fn(),
  arcjetDefault: vi.fn(() => ({ protect: mockProtect })),
  envObj: { ARCJET_KEY: undefined as string | undefined },
}));

vi.mock("@arcjet/next", () => ({
  default: arcjetDefault,
  fixedWindow: vi.fn(() => ({ rule: "fixedWindow" })),
  shield: vi.fn(() => ({ rule: "shield" })),
}));
vi.mock("@httpjpg/env", () => ({ env: envObj }));

const request = {} as NextRequest;

async function loadEnforce() {
  return (await import("./rate-limit")).enforceRateLimit;
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  envObj.ARCJET_KEY = "test-key";
});

describe("enforceRateLimit", () => {
  it("is a no-op when no ARCJET_KEY is configured", async () => {
    envObj.ARCJET_KEY = undefined;
    const enforceRateLimit = await loadEnforce();
    expect(await enforceRateLimit(request)).toBeNull();
    expect(arcjetDefault).not.toHaveBeenCalled();
  });

  it("allows the request when Arcjet does not deny it", async () => {
    mockProtect.mockResolvedValueOnce({ isDenied: () => false });
    const enforceRateLimit = await loadEnforce();
    expect(await enforceRateLimit(request)).toBeNull();
  });

  it("returns 429 when the request is rate limited", async () => {
    mockProtect.mockResolvedValueOnce({
      isDenied: () => true,
      reason: { isRateLimit: () => true },
    });
    const enforceRateLimit = await loadEnforce();
    const response = await enforceRateLimit(request);
    expect(response?.status).toBe(429);
    await expect(response?.json()).resolves.toEqual({ error: "rate_limited" });
  });

  it("returns 403 when denied for a non-rate-limit reason", async () => {
    mockProtect.mockResolvedValueOnce({
      isDenied: () => true,
      reason: { isRateLimit: () => false },
    });
    const enforceRateLimit = await loadEnforce();
    const response = await enforceRateLimit(request);
    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({ error: "forbidden" });
  });

  it("fails open (allows) and logs when the limiter throws", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockProtect.mockRejectedValueOnce(new Error("arcjet down"));
    const enforceRateLimit = await loadEnforce();
    expect(await enforceRateLimit(request)).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("reuses a single Arcjet client across calls", async () => {
    mockProtect.mockResolvedValue({ isDenied: () => false });
    const enforceRateLimit = await loadEnforce();
    await enforceRateLimit(request);
    await enforceRateLimit(request);
    expect(arcjetDefault).toHaveBeenCalledTimes(1);
  });
});
