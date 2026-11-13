import { act, fireEvent, render, screen } from "@testing-library/react";

import { useDesktopDrag } from "./use-desktop-drag";

interface HarnessProps {
  onSelect?: () => void;
}

function Harness({ onSelect = () => {} }: HarnessProps) {
  const { offset, dragging, handlers } = useDesktopDrag<HTMLDivElement>({
    onSelect,
    noDragSelector: "[data-no-drag]",
  });
  return (
    <div
      data-testid="item"
      data-dragging={dragging ? "" : undefined}
      data-offset={offset ? `${offset.x},${offset.y}` : "none"}
      {...handlers}
    >
      <span data-no-drag="" data-testid="inert" />
    </div>
  );
}

function setViewport(width: number, height: number) {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal("innerHeight", height);
}

/** A 200×100 item whose top-left corner sits at 100,100. */
function renderItem(onSelect?: () => void): HTMLElement {
  render(<Harness onSelect={onSelect} />);
  const item = screen.getByTestId("item");
  vi.spyOn(item, "getBoundingClientRect").mockReturnValue({
    x: 100,
    y: 100,
    left: 100,
    top: 100,
    width: 200,
    height: 100,
    right: 300,
    bottom: 200,
    toJSON() {
      return {};
    },
  });
  return item;
}

describe("useDesktopDrag", () => {
  beforeEach(() => {
    setViewport(1000, 800);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("selects on pointer down but stays put below the 4px threshold", () => {
    const onSelect = vi.fn();
    const item = renderItem(onSelect);

    fireEvent.pointerDown(item, { button: 0, pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 152, clientY: 152 });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(item).toHaveAttribute("data-offset", "none");
    expect(item).not.toHaveAttribute("data-dragging");
  });

  it("starts dragging at the threshold and keeps following below it afterwards", () => {
    const item = renderItem();

    fireEvent.pointerDown(item, { button: 0, pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 154, clientY: 150 });
    expect(item).toHaveAttribute("data-offset", "104,100");
    expect(item).toHaveAttribute("data-dragging");

    fireEvent.pointerMove(item, { pointerId: 1, clientX: 151, clientY: 150 });
    expect(item).toHaveAttribute("data-offset", "101,100");

    fireEvent.pointerUp(item, { pointerId: 1 });
    expect(item).not.toHaveAttribute("data-dragging");
  });

  it("clamps the item inside the viewport, 8px from every edge", () => {
    const item = renderItem();

    fireEvent.pointerDown(item, { button: 0, pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 5000, clientY: 5000 });
    expect(item).toHaveAttribute("data-offset", "792,692");

    fireEvent.pointerMove(item, { pointerId: 1, clientX: -5000, clientY: -5000 });
    expect(item).toHaveAttribute("data-offset", "8,8");
  });

  it("continues a second drag from the dragged position", () => {
    const item = renderItem();

    fireEvent.pointerDown(item, { button: 0, pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 250, clientY: 250 });
    fireEvent.pointerUp(item, { pointerId: 1 });
    expect(item).toHaveAttribute("data-offset", "200,200");

    fireEvent.pointerDown(item, { button: 0, pointerId: 2, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(item, { pointerId: 2, clientX: 10, clientY: 10 });
    expect(item).toHaveAttribute("data-offset", "210,210");
  });

  it("re-clamps a dragged item when the viewport shrinks or rotates", () => {
    const item = renderItem();

    fireEvent.pointerDown(item, { button: 0, pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 750, clientY: 650 });
    fireEvent.pointerUp(item, { pointerId: 1 });
    expect(item).toHaveAttribute("data-offset", "700,600");

    setViewport(500, 400);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(item).toHaveAttribute("data-offset", "292,292");

    setViewport(400, 300);
    act(() => {
      window.dispatchEvent(new Event("orientationchange"));
    });
    expect(item).toHaveAttribute("data-offset", "192,192");
  });

  it("leaves an undragged item at its scatter position on resize", () => {
    const item = renderItem();

    setViewport(300, 200);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(item).toHaveAttribute("data-offset", "none");
  });

  it("selects but never drags from inside the no-drag selector", () => {
    const onSelect = vi.fn();
    const item = renderItem(onSelect);

    fireEvent.pointerDown(screen.getByTestId("inert"), {
      button: 0,
      pointerId: 1,
      clientX: 150,
      clientY: 150,
    });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 400, clientY: 400 });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(item).toHaveAttribute("data-offset", "none");
  });

  it("ignores secondary buttons and foreign pointers", () => {
    const onSelect = vi.fn();
    const item = renderItem(onSelect);

    fireEvent.pointerDown(item, { button: 2, pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 400, clientY: 400 });
    expect(onSelect).not.toHaveBeenCalled();
    expect(item).toHaveAttribute("data-offset", "none");

    fireEvent.pointerDown(item, { button: 0, pointerId: 1, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(item, { pointerId: 9, clientX: 400, clientY: 400 });
    fireEvent.pointerUp(item, { pointerId: 9 });
    expect(item).toHaveAttribute("data-offset", "none");

    fireEvent.pointerCancel(item, { pointerId: 1 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 400, clientY: 400 });
    expect(item).toHaveAttribute("data-offset", "none");
  });

  it("captures the pointer for the drag and releases it afterwards", () => {
    const item = renderItem();
    const capture = vi.fn();
    const release = vi.fn();
    item.setPointerCapture = capture;
    item.releasePointerCapture = release;

    fireEvent.pointerDown(item, { button: 0, pointerId: 7, clientX: 150, clientY: 150 });
    expect(capture).toHaveBeenCalledWith(7);
    fireEvent.pointerUp(item, { pointerId: 7 });
    expect(release).toHaveBeenCalledWith(7);
  });
});
