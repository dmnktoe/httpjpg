import { act, renderHook } from "@testing-library/react";

import { useLightbox } from "./use-lightbox";

describe("useLightbox", () => {
  it("starts closed on the first item", () => {
    const { result } = renderHook(() => useLightbox());

    expect(result.current.open).toBe(false);
    expect(result.current.index).toBe(0);
  });

  it("opens on the item it is handed", () => {
    const { result } = renderHook(() => useLightbox());

    act(() => result.current.openAt(3));

    expect(result.current.open).toBe(true);
    expect(result.current.index).toBe(3);
  });

  it("closes without forgetting where it was", () => {
    const { result } = renderHook(() => useLightbox());

    act(() => result.current.openAt(2));
    act(() => result.current.close());

    expect(result.current.open).toBe(false);
    expect(result.current.index).toBe(2);
  });

  it("moves the index while staying open", () => {
    const { result } = renderHook(() => useLightbox());

    act(() => result.current.openAt(0));
    act(() => result.current.setIndex(4));

    expect(result.current.open).toBe(true);
    expect(result.current.index).toBe(4);
  });
});
