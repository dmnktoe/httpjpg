import { fireEvent, render, screen } from "@testing-library/react";

import { Canvas } from "./canvas";
import { type BuilderItem, emptySpacing } from "./lib";

function item(overrides: Partial<BuilderItem> = {}): BuilderItem {
  return {
    id: "item-a",
    type: "headline",
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    spacing: emptySpacing(),
    data: { text: "Hello", level: "2" },
    ...overrides,
  };
}

const settings = { columns: 12, gap: "4" };

describe("Canvas", () => {
  it("selects, deselects, deletes, and adds rows", () => {
    const onSelect = vi.fn();
    const onItemsChange = vi.fn();
    const onAddRows = vi.fn();
    const onRemoveRows = vi.fn();

    render(
      <Canvas
        items={[item()]}
        selectedId="item-a"
        settings={settings}
        viewport="lg"
        extraRows={10}
        onItemsChange={onItemsChange}
        onSelect={onSelect}
        onAddRows={onAddRows}
        onRemoveRows={onRemoveRows}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Headline block" }));
    expect(onSelect).toHaveBeenCalledWith("item-a");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onItemsChange).toHaveBeenCalledWith([]);
    expect(onSelect).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByRole("button", { name: "+ 10 rows" }));
    expect(onAddRows).toHaveBeenCalledWith(10);
    fireEvent.click(screen.getByRole("button", { name: "− 10 rows" }));
    expect(onRemoveRows).toHaveBeenCalledWith(10);
  });

  it("drops a palette blok onto the grid", () => {
    const onItemsChange = vi.fn();
    const onSelect = vi.fn();
    render(
      <Canvas
        items={[]}
        selectedId={null}
        settings={settings}
        viewport="lg"
        extraRows={0}
        onItemsChange={onItemsChange}
        onSelect={onSelect}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );

    const canvas = screen.getByRole("application", { name: "Grid canvas" });
    const dataTransfer = {
      getData: (type: string) => (type === "application/x-blok-type" ? "headline" : ""),
      dropEffect: "",
    };
    fireEvent.dragOver(canvas, { dataTransfer, clientX: 10, clientY: 10 });
    fireEvent.drop(canvas, { dataTransfer, clientX: 10, clientY: 10 });

    expect(onItemsChange).toHaveBeenCalledWith([
      expect.objectContaining({
        type: "headline",
        data: expect.objectContaining({ text: "Headline" }),
      }),
    ]);
    expect(onSelect).toHaveBeenCalled();
  });

  it("ignores a drop without a known blok type", () => {
    const onItemsChange = vi.fn();
    render(
      <Canvas
        items={[]}
        selectedId={null}
        settings={settings}
        viewport="lg"
        extraRows={0}
        onItemsChange={onItemsChange}
        onSelect={vi.fn()}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    fireEvent.drop(screen.getByRole("application", { name: "Grid canvas" }), {
      dataTransfer: { getData: () => "" },
    });
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("clears the selection on Escape", () => {
    const onSelect = vi.fn();
    render(
      <Canvas
        items={[item()]}
        selectedId="item-a"
        settings={settings}
        viewport="base"
        extraRows={0}
        onItemsChange={vi.fn()}
        onSelect={onSelect}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("moves and resizes a selected item with pointer events", () => {
    const onItemsChange = vi.fn();
    render(
      <Canvas
        items={[item({ hiddenLg: true, spacing: { base: { mt: "4", pt: "2" }, md: {}, lg: {} } })]}
        selectedId="item-a"
        settings={settings}
        viewport="lg"
        extraRows={0}
        onItemsChange={onItemsChange}
        onSelect={vi.fn()}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    const canvas = screen.getByRole("application", { name: "Grid canvas" });
    Object.defineProperty(canvas, "clientWidth", { value: 1200, configurable: true });

    fireEvent.pointerDown(screen.getByRole("button", { name: "Headline block" }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerMove(window, { clientX: 200, clientY: 80 });
    fireEvent.pointerUp(window);
    expect(onItemsChange).toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Resize" }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerMove(window, { clientX: 100, clientY: 40 });
    fireEvent.pointerCancel(window);

    fireEvent.pointerDown(canvas);
    fireEvent.keyDown(screen.getByRole("button", { name: "Headline block" }), { key: "Delete" });
    fireEvent.dragLeave(canvas);
  });

  it("ignores unknown blok types and does not delete unselected items", () => {
    const onItemsChange = vi.fn();
    const { rerender } = render(
      <Canvas
        items={[]}
        selectedId={null}
        settings={settings}
        viewport="base"
        extraRows={0}
        onItemsChange={onItemsChange}
        onSelect={vi.fn()}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    fireEvent.drop(screen.getByRole("application", { name: "Grid canvas" }), {
      dataTransfer: { getData: () => "not-a-blok" },
    });
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "− 10 rows" })).toBeDisabled();

    rerender(
      <Canvas
        items={[item({ type: "ghost", alignSelf: "center", justifySelf: "end" })]}
        selectedId={null}
        settings={settings}
        viewport="md"
        extraRows={0}
        onItemsChange={onItemsChange}
        onSelect={vi.fn()}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "ghost block" }), { key: "Delete" });
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("ignores pointer moves when the canvas has no width", () => {
    const onItemsChange = vi.fn();
    render(
      <Canvas
        items={[item()]}
        selectedId="item-a"
        settings={{ columns: 12, gap: "" }}
        viewport="lg"
        extraRows={0}
        onItemsChange={onItemsChange}
        onSelect={vi.fn()}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    const canvas = screen.getByRole("application", { name: "Grid canvas" });
    Object.defineProperty(canvas, "clientWidth", { value: 0, configurable: true });
    fireEvent.pointerDown(screen.getByRole("button", { name: "Headline block" }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerMove(window, { clientX: 80, clientY: 40 });
    fireEvent.pointerUp(window);
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("shows a hover cell while dragging a palette blok over the grid", () => {
    render(
      <Canvas
        items={[]}
        selectedId={null}
        settings={settings}
        viewport="lg"
        extraRows={0}
        onItemsChange={vi.fn()}
        onSelect={vi.fn()}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    const canvas = screen.getByRole("application", { name: "Grid canvas" });
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      width: 1200,
      height: 800,
      top: 0,
      left: 0,
      bottom: 800,
      right: 1200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.dragOver(canvas, {
      dataTransfer: { dropEffect: "", getData: () => "headline" },
      clientX: 80,
      clientY: 40,
    });
    expect(canvas.querySelector("[style]")).not.toBeNull();
  });

  it("resizes on the tablet breakpoint", () => {
    const onItemsChange = vi.fn();
    render(
      <Canvas
        items={[item({ wMd: 4, hMd: 2 })]}
        selectedId="item-a"
        settings={settings}
        viewport="md"
        extraRows={0}
        onItemsChange={onItemsChange}
        onSelect={vi.fn()}
        onAddRows={vi.fn()}
        onRemoveRows={vi.fn()}
      />,
    );
    const canvas = screen.getByRole("application", { name: "Grid canvas" });
    Object.defineProperty(canvas, "clientWidth", { value: 768, configurable: true });
    fireEvent.pointerDown(screen.getByRole("button", { name: "Resize" }), {
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerMove(window, { clientX: 80, clientY: 40 });
    fireEvent.pointerUp(window);
    expect(onItemsChange).toHaveBeenCalled();
  });
});
