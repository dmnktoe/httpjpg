import { renderHook } from "@testing-library/react";
import { act } from "react";

import { emptySpacing, type BuilderItem } from "./lib";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";

function item(id = "a"): BuilderItem {
  return {
    id,
    type: "headline",
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    spacing: emptySpacing(),
    data: {},
  };
}

function key(init: KeyboardEventInit) {
  window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
}

describe("useKeyboardShortcuts", () => {
  it("undoes, redoes, duplicates, deletes, and nudges the selection", () => {
    const setItems = vi.fn();
    const setSelectedId = vi.fn();
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const source = item();

    renderHook(() =>
      useKeyboardShortcuts({
        selectedId: source.id,
        items: [source],
        settings: { columns: 12, gap: "4" },
        viewport: "lg",
        setItems,
        setSelectedId,
        onUndo,
        onRedo,
      }),
    );

    act(() => key({ key: "z", metaKey: true }));
    expect(onUndo).toHaveBeenCalled();
    act(() => key({ key: "z", metaKey: true, shiftKey: true }));
    expect(onRedo).toHaveBeenCalled();
    act(() => key({ key: "y", ctrlKey: true }));
    expect(onRedo).toHaveBeenCalledTimes(2);

    act(() => key({ key: "d", metaKey: true }));
    expect(setItems).toHaveBeenCalled();
    expect(setSelectedId).toHaveBeenCalled();

    act(() => key({ key: "Delete" }));
    expect(setSelectedId).toHaveBeenCalledWith(null);

    act(() => key({ key: "ArrowRight" }));
    expect(setItems).toHaveBeenCalled();
    act(() => key({ key: "ArrowLeft", shiftKey: true }));
    act(() => key({ key: "ArrowUp" }));
    act(() => key({ key: "ArrowDown" }));
    act(() => key({ key: "Backspace" }));
    expect(setSelectedId).toHaveBeenCalledWith(null);
  });

  it("ignores shortcuts originating from an input", () => {
    const onUndo = vi.fn();
    const setItems = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        selectedId: "a",
        items: [item()],
        settings: { columns: 12, gap: "4" },
        viewport: "lg",
        setItems,
        setSelectedId: vi.fn(),
        onUndo,
        onRedo: vi.fn(),
      }),
    );
    for (const el of [
      Object.assign(document.createElement("input"), {}),
      document.createElement("textarea"),
      document.createElement("select"),
    ]) {
      document.body.appendChild(el);
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      el.remove();
    }
    const div = document.createElement("div");
    Object.defineProperty(div, "isContentEditable", { value: true });
    document.body.appendChild(div);
    div.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    div.remove();
    expect(setItems).not.toHaveBeenCalled();

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "z", metaKey: true, bubbles: true }));
    input.remove();
    expect(onUndo).not.toHaveBeenCalled();
  });

  it("no-ops without a selection or when the id is stale", () => {
    const setItems = vi.fn();
    const { rerender } = renderHook(
      (props: { selectedId: string | null }) =>
        useKeyboardShortcuts({
          selectedId: props.selectedId,
          items: [item()],
          settings: { columns: 12, gap: "4" },
          viewport: "md",
          setItems,
          setSelectedId: vi.fn(),
          onUndo: vi.fn(),
          onRedo: vi.fn(),
        }),
      { initialProps: { selectedId: null as string | null } },
    );
    act(() => key({ key: "Delete" }));
    expect(setItems).not.toHaveBeenCalled();
    rerender({ selectedId: "missing" });
    act(() => key({ key: "Delete" }));
    expect(setItems).not.toHaveBeenCalled();
  });
});
