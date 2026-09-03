import { renderHook, waitFor } from "@testing-library/react";

import { useNowPlaying } from "./use-now-playing";

function mockFetch(status: number, body: unknown, ok = status >= 200 && status < 300) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      statusText: "",
      json: async () => body,
    }),
  );
}

describe("useNowPlaying", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("exposes the track data on success", async () => {
    mockFetch(200, { data: { title: "Song", isPlaying: true } });

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ title: "Song", isPlaying: true });
    expect(result.current.error).toBeNull();
    expect(result.current.errorCode).toBeNull();
  });

  it("surfaces an unavailable state carried by a 200 (e.g. premium_missing)", async () => {
    mockFetch(200, { data: null, unavailable: "premium_missing", message: "no premium" });

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("premium_missing");
    expect(result.current.error?.message).toBe("no premium");
    expect(result.current.data).toBeNull();
  });

  it("stops polling once the state is terminal", async () => {
    vi.useFakeTimers();
    mockFetch(200, { data: null, unavailable: "premium_missing" });

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 1000 }));

    await vi.waitFor(() => expect(result.current.errorCode).toBe("premium_missing"));
    expect(fetch).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(5000);
    expect(fetch).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("skips a tick while a request is still in flight", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 1000 }));

    await vi.advanceTimersByTimeAsync(5000);
    expect(fetch).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("ignores a response that lands after polling stopped", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "",
        json: async () => ({ data: null, unavailable: "premium_missing" }),
      })
      .mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "",
        json: async () => ({ data: { title: "Late", isPlaying: true } }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 1000 }));

    await vi.waitFor(() => expect(result.current.errorCode).toBe("premium_missing"));
    await vi.advanceTimersByTimeAsync(5000);

    expect(result.current.errorCode).toBe("premium_missing");
    expect(result.current.data).toBeNull();

    vi.useRealTimers();
  });

  it("gives up after repeated failures instead of polling forever", async () => {
    vi.useFakeTimers();
    mockFetch(500, { error: "internal_error" }, false);

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 1000 }));

    await vi.waitFor(() => expect(result.current.errorCode).toBe("internal_error"));
    await vi.advanceTimersByTimeAsync(20000);

    expect(fetch).toHaveBeenCalledTimes(5);

    vi.useRealTimers();
  });

  it("surfaces an error code carried by a failed response", async () => {
    mockFetch(500, { error: "internal_error", message: "boom" }, false);

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("internal_error");
    expect(result.current.error?.message).toBe("boom");
    expect(result.current.data).toBeNull();
  });

  it("reports a network_error when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("network_error");
    expect(result.current.data).toBeNull();
  });

  it("falls back to fetch_error for an unknown or missing error code", async () => {
    mockFetch(500, { error: "something_unexpected" }, false);

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("fetch_error");
    expect(result.current.data).toBeNull();
  });

  it("does not fetch when disabled", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useNowPlaying({ endpoint: "/np", enabled: false }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a successful empty payload as idle with no track", async () => {
    mockFetch(200, {});

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("uses fallback messages when the payload omits them", async () => {
    mockFetch(200, { unavailable: "premium_missing" });

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.errorCode).toBe("premium_missing"));
    expect(result.current.error?.message).toBe("Now playing is unavailable");
  });

  it("uses the status text when a failed response has no message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        json: async () => {
          throw new Error("not json");
        },
      }),
    );

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("fetch_error");
    expect(result.current.error?.message).toBe("Failed to fetch: Bad Gateway");
  });

  it("wraps a non-Error throw as a network_error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("nope"));

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("network_error");
    expect(result.current.error?.message).toBe("Unknown error");
  });
});
