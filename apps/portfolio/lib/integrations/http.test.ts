// @vitest-environment node
import { afterEach, beforeEach, type MockedFunction, vi } from "vitest";

import { fetchWithTimeout, readJson } from "./http";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

describe("fetchWithTimeout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes the url through and defaults to an uncached request", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    await fetchWithTimeout("https://example.test/data", { label: "Example" });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.test/data",
      expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
    );
  });

  it("forwards extra request options and lets them override the cache mode", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    await fetchWithTimeout("https://example.test/data", {
      label: "Example",
      cache: "force-cache",
      headers: { "User-Agent": "httpjpg" },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.test/data",
      expect.objectContaining({
        cache: "force-cache",
        headers: { "User-Agent": "httpjpg" },
      }),
    );
  });

  it("returns the response on success", async () => {
    const response = jsonResponse({ hello: "world" });
    mockFetch.mockResolvedValueOnce(response);

    const result = await fetchWithTimeout("https://example.test/data", { label: "Example" });

    expect(result).toEqual({ ok: true, response });
  });

  it("reports a non-2xx response with the upstream status", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("", false, 503));

    const result = await fetchWithTimeout("https://example.test/data", { label: "Example" });

    expect(result).toEqual({ ok: false, status: 503, message: "Status 503." });
  });

  it("appends the hint to a non-2xx message", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse("", false, 404));

    const result = await fetchWithTimeout("https://example.test/data", {
      label: "Example",
      hint: "Check the username.",
    });

    expect(result).toEqual({
      ok: false,
      status: 404,
      message: "Status 404. Check the username.",
    });
  });

  it("reports an aborted request as a 504 naming the upstream", async () => {
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));

    const result = await fetchWithTimeout("https://example.test/data", { label: "Weather" });

    expect(result).toEqual({ ok: false, status: 504, message: "Weather request timed out." });
  });

  it("re-throws network errors that are not the timeout", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("network down"));

    await expect(
      fetchWithTimeout("https://example.test/data", { label: "Example" }),
    ).rejects.toThrow("network down");
  });

  it("aborts the request once the timeout elapses", async () => {
    vi.useFakeTimers();
    mockFetch.mockImplementationOnce(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          (init as RequestInit).signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );

    const pending = fetchWithTimeout("https://example.test/slow", {
      label: "Example",
      timeoutMs: 100,
    });
    await vi.advanceTimersByTimeAsync(100);

    expect(await pending).toEqual({
      ok: false,
      status: 504,
      message: "Example request timed out.",
    });
  });
});

describe("readJson", () => {
  it("returns the parsed body", async () => {
    const result = await readJson<{ id: number }>(jsonResponse({ id: 7 }), "Example");
    expect(result).toEqual({ ok: true, data: { id: 7 } });
  });

  it("turns a malformed body into a 502", async () => {
    const response = {
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    } as unknown as Response;

    const result = await readJson(response, "Example");

    expect(result).toEqual({ ok: false, status: 502, message: "Malformed Example response." });
  });
});
