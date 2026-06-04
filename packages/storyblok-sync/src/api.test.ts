// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi, type MockedFunction } from "vitest";

import { getEnv, STORYBLOK_API, storyblokRequest, validateEnv } from "./api";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const fetchMock = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function emptyResponse(): Response {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    text: async () => "",
  } as unknown as Response;
}

function errorResponse(status: number, body = "", retryAfter?: string): Response {
  return {
    ok: false,
    status,
    headers: {
      get: (name: string) => (name.toLowerCase() === "retry-after" ? (retryAfter ?? null) : null),
    },
    text: async () => body,
  } as unknown as Response;
}

/** Resolve a throttled/retried request while advancing fake timers. */
async function settle<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

describe("getEnv", () => {
  it("reads token and space id from the environment", () => {
    process.env.STORYBLOK_SPACE_ID = "42";
    process.env.STORYBLOK_MANAGEMENT_TOKEN = "tok";
    expect(getEnv()).toEqual({ spaceId: "42", token: "tok" });
  });
});

describe("validateEnv", () => {
  it("exits when the management token is missing", () => {
    delete process.env.STORYBLOK_MANAGEMENT_TOKEN;
    process.env.STORYBLOK_SPACE_ID = "42";
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });

    expect(() => validateEnv()).toThrow("exit");
    expect(exit).toHaveBeenCalledWith(1);

    error.mockRestore();
    exit.mockRestore();
  });

  it("exits when the space id is missing", () => {
    process.env.STORYBLOK_MANAGEMENT_TOKEN = "tok";
    delete process.env.STORYBLOK_SPACE_ID;
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });

    expect(() => validateEnv()).toThrow("exit");

    error.mockRestore();
    exit.mockRestore();
  });
});

describe("storyblokRequest", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.STORYBLOK_SPACE_ID = "42";
    process.env.STORYBLOK_MANAGEMENT_TOKEN = "tok";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("requests the space-scoped URL with the auth header", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await settle(storyblokRequest("/components"));

    expect(fetchMock).toHaveBeenCalledWith(
      `${STORYBLOK_API}/spaces/42/components`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "tok" }),
      }),
    );
  });

  it("parses the JSON body on success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ datasource: { id: 7 } }));

    const result = await settle(storyblokRequest<{ datasource: { id: number } }>("/datasources"));

    expect(result).toEqual({ datasource: { id: 7 } });
  });

  it("returns an empty object for an empty response body", async () => {
    fetchMock.mockResolvedValueOnce(emptyResponse());

    const result = await settle(storyblokRequest("/components/1", "DELETE"));

    expect(result).toEqual({});
  });

  it("serializes the body for write methods", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await settle(storyblokRequest("/components", "POST", { component: { name: "x" } }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ component: { name: "x" } }),
      }),
    );
  });

  it("throws on a non-ok, non-429 response", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(404, "not found"));

    const assertion = expect(storyblokRequest("/missing")).rejects.toThrow(
      "Storyblok API error (404): not found",
    );
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries a 429 and succeeds on the next attempt", async () => {
    fetchMock
      .mockResolvedValueOnce(errorResponse(429))
      .mockResolvedValueOnce(jsonResponse({ recovered: true }));

    const result = await settle(storyblokRequest<{ recovered: boolean }>("/components"));

    expect(result).toEqual({ recovered: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after the retry budget is exhausted", async () => {
    fetchMock.mockResolvedValue(errorResponse(429));

    const assertion = expect(storyblokRequest("/components")).rejects.toThrow(
      "Storyblok API error (429)",
    );
    await vi.runAllTimersAsync();
    await assertion;
    // 5 retries + the final attempt that throws.
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("honors the Retry-After header for the backoff delay", async () => {
    const callTimes: number[] = [];
    fetchMock.mockImplementation(async () => {
      callTimes.push(Date.now());
      return callTimes.length === 1 ? errorResponse(429, "", "2") : jsonResponse({});
    });

    await settle(storyblokRequest("/components"));

    expect(callTimes).toHaveLength(2);
    // Retry-After: 2 → at least a 2000ms gap, far above the 200ms default.
    expect(callTimes[1] - callTimes[0]).toBeGreaterThanOrEqual(2000);
  });

  it("spaces consecutive requests under the rate limit", async () => {
    const callTimes: number[] = [];
    fetchMock.mockImplementation(async () => {
      callTimes.push(Date.now());
      return jsonResponse({});
    });

    const first = storyblokRequest("/a");
    const second = storyblokRequest("/b");
    await vi.runAllTimersAsync();
    await Promise.all([first, second]);

    expect(callTimes).toHaveLength(2);
    expect(callTimes[1] - callTimes[0]).toBeGreaterThanOrEqual(200);
  });
});
