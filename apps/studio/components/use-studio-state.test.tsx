import { act, renderHook, waitFor } from "@testing-library/react";

const KEY = "httpjpg.studio.grid.v1";

async function loadHook() {
  vi.resetModules();
  const { useStudioState } = await import("./use-studio-state");
  return useStudioState;
}

describe("useStudioState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty and persists edits", async () => {
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    expect(result.current.state.items).toEqual([]);
    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.set((s) => ({ ...s, extraRows: 10 }));
    });
    expect(result.current.state.extraRows).toBe(10);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.state.extraRows).toBe(0);
    expect(result.current.canRedo).toBe(true);
    act(() => result.current.redo());
    expect(result.current.state.extraRows).toBe(10);

    await waitFor(() => {
      expect(window.localStorage.getItem(KEY)).toContain("extraRows");
    });
  });

  it("hydrates a stored v1 grid and migrates flat spacing", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        items: [{ id: "a", type: "headline", x: 0, y: 0, w: 4, h: 2, mt: "4", data: {} }],
        settings: { columns: 12, gap: "4" },
        viewport: "md",
        extraRows: 0,
      }),
    );
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    expect(result.current.state.items[0]?.spacing.base.mt).toBe("4");
    expect(result.current.state.viewport).toBe("md");
  });

  it("ignores corrupt storage and no-op sets", async () => {
    window.localStorage.setItem(KEY, "{not json");
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    expect(result.current.state.items).toEqual([]);
    const before = result.current.state;
    act(() => result.current.set((s) => s));
    expect(result.current.state).toBe(before);
  });

  it("replace and reset push history", async () => {
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    act(() => {
      result.current.replace({
        ...result.current.state,
        extraRows: 20,
      });
    });
    expect(result.current.state.extraRows).toBe(20);
    act(() => result.current.reset());
    expect(result.current.state.extraRows).toBe(0);
    expect(result.current.canUndo).toBe(true);
  });

  it("keeps transient viewport changes out of undo history", async () => {
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    act(() => {
      result.current.set((s) => ({ ...s, viewport: "md" }), { transient: true });
    });
    expect(result.current.state.viewport).toBe("md");
    expect(result.current.canUndo).toBe(false);
    act(() => result.current.undo());
    expect(result.current.state.viewport).toBe("md");
  });

  it("hydrates from a storage event and ignores unrelated keys", async () => {
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        items: [],
        settings: { columns: 12, gap: "4" },
        viewport: "base",
        extraRows: 5,
      }),
    );
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    });
    expect(result.current.state.extraRows).toBe(5);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    });
    expect(result.current.state.extraRows).toBe(5);
  });

  it("survives a quota error when persisting", async () => {
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    act(() => {
      result.current.set((s) => ({ ...s, extraRows: 3 }));
    });
    expect(result.current.state.extraRows).toBe(3);
  });

  it("no-ops undo and redo at the ends of history", async () => {
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.state.extraRows).toBe(0);
  });

  it("drops history past the limit and rejects a non-array items payload", async () => {
    const useStudioState = await loadHook();
    const { result } = renderHook(() => useStudioState());
    act(() => {
      for (let i = 0; i < 52; i++) {
        result.current.set((s) => ({ ...s, extraRows: i + 1 }));
      }
    });
    expect(result.current.state.extraRows).toBe(52);
    act(() => {
      for (let i = 0; i < 50; i++) {
        result.current.undo();
      }
    });
    expect(result.current.state.extraRows).toBe(2);
    expect(result.current.canUndo).toBe(false);

    window.localStorage.setItem(KEY, JSON.stringify({ items: "nope", extraRows: 9 }));
    const useStudioStateAgain = await loadHook();
    const next = renderHook(() => useStudioStateAgain());
    expect(next.result.current.state.items).toEqual([]);
    expect(next.result.current.state.extraRows).toBe(0);
  });
});
