import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useWidgetQuery } from "./use-widget-query";

const schema = z.object({ title: z.string() });

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("useWidgetQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the parsed payload", async () => {
    mockFetch({ title: "Dune" });
    const { result } = renderHook(() =>
      useWidgetQuery({ endpoint: "/api/letterboxd", schema, label: "films" }),
    );

    await waitFor(() => expect(result.current.data).toEqual({ title: "Dune" }));
    expect(result.current.loaded).toBe(true);
  });

  it("treats a non-ok response as empty", async () => {
    mockFetch({}, false);
    const { result } = renderHook(() =>
      useWidgetQuery({ endpoint: "/api/letterboxd", schema, label: "films" }),
    );

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("treats a payload that fails the schema as empty", async () => {
    mockFetch({ title: 12 });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useWidgetQuery({ endpoint: "/api/letterboxd", schema, label: "films" }),
    );

    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.data).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("ignores a thrown fetch when the hook unmounts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result, unmount } = renderHook(() =>
      useWidgetQuery({ endpoint: "/api/letterboxd", schema, label: "films" }),
    );

    unmount();
    await waitFor(() => expect(result.current.loaded).toBe(false));
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("polls when an interval is set", async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetch({ title: "Dune" });
    renderHook(() =>
      useWidgetQuery({
        endpoint: "/api/discord",
        schema,
        label: "discord",
        intervalMs: 30_000,
      }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
