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

  it("surfaces the endpoint error code (e.g. premium_missing)", async () => {
    mockFetch(403, { error: "premium_missing", message: "no premium" }, false);

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("premium_missing");
    expect(result.current.error?.message).toBe("no premium");
    expect(result.current.data).toBeNull();
  });

  it("reports a network_error when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { result } = renderHook(() => useNowPlaying({ endpoint: "/np", pollInterval: 100000 }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorCode).toBe("network_error");
    expect(result.current.data).toBeNull();
  });

  it("does not fetch when disabled", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useNowPlaying({ endpoint: "/np", enabled: false }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
