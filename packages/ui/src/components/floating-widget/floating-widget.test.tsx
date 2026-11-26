import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { FloatingWidget } from "./floating-widget";

function stubViewport(isFloating: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: isFloating })),
  );
}

function widget(): HTMLElement {
  return screen.getByTestId("widget");
}

function drag(target: HTMLElement, from: [number, number], to: [number, number]) {
  fireEvent.pointerDown(target, { pointerId: 1, button: 0, clientX: from[0], clientY: from[1] });
  fireEvent.pointerMove(target, { pointerId: 1, buttons: 1, clientX: to[0], clientY: to[1] });
  fireEvent.pointerUp(target, { pointerId: 1, clientX: to[0], clientY: to[1] });
}

function clickGoesThrough(detail = 1): boolean {
  return fireEvent.click(screen.getByRole("link", { name: "inside" }), { detail });
}

function renderWidget(props: { floatingQuery?: string } = {}) {
  return render(
    <FloatingWidget data-testid="widget" css={{ mt: "4" }} style={{ opacity: 0.5 }} {...props}>
      <a href="/feed">inside</a>
    </FloatingWidget>,
  );
}

beforeEach(() => {
  stubViewport(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FloatingWidget", () => {
  it("wraps its children and keeps the caller's styles", () => {
    renderWidget();

    expect(widget()).toHaveAttribute("data-draggable", "true");
    expect(widget().className).toContain("jpg-mt_4");
    expect(widget().style.opacity).toBe("0.5");
  });

  it("lets a plain click through", () => {
    renderWidget();

    fireEvent.pointerDown(widget(), { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
    fireEvent.pointerUp(widget(), { pointerId: 1, clientX: 51, clientY: 50 });

    expect(clickGoesThrough()).toBe(true);
    expect(widget().style.left).toBe("");
  });

  it("moves with a drag and swallows the click that ends it", () => {
    renderWidget();

    drag(widget(), [50, 50], [120, 90]);

    expect(widget().style.left).not.toBe("");
    expect(widget().style.right).toBe("auto");
    expect(widget().style.bottom).toBe("auto");
    expect(widget().style.opacity).toBe("0.5");
    expect(clickGoesThrough()).toBe(false);
    expect(clickGoesThrough()).toBe(true);
  });

  it("forgets a drag that no click followed once the next press starts", () => {
    renderWidget();

    drag(widget(), [50, 50], [120, 90]);
    fireEvent.pointerDown(widget(), { pointerId: 1, button: 0, clientX: 130, clientY: 90 });
    fireEvent.pointerUp(widget(), { pointerId: 1, clientX: 130, clientY: 90 });

    expect(clickGoesThrough()).toBe(true);
  });

  it("swallows the click that ends a drag however late it arrives, but never a key press", () => {
    vi.useFakeTimers();
    renderWidget();

    drag(widget(), [50, 50], [120, 90]);
    vi.runAllTimers();

    expect(clickGoesThrough(0)).toBe(true);
    expect(clickGoesThrough()).toBe(false);
    vi.useRealTimers();
  });

  it("lets go when the button came up outside, so hovering later moves nothing", () => {
    renderWidget();

    fireEvent.pointerDown(widget(), { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(widget(), { pointerId: 1, buttons: 0, clientX: 140, clientY: 90 });
    fireEvent.pointerMove(widget(), { pointerId: 1, buttons: 0, clientX: 200, clientY: 120 });

    expect(widget().style.left).toBe("");
    expect(clickGoesThrough()).toBe(true);
  });

  it("captures the pointer only once the press becomes a drag", () => {
    renderWidget();
    const setPointerCapture = vi.fn();
    const releasePointerCapture = vi.fn();
    Object.assign(widget(), { setPointerCapture, releasePointerCapture });

    fireEvent.pointerDown(widget(), { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    setPointerCapture.mockClear();

    fireEvent.pointerMove(widget(), { pointerId: 1, buttons: 1, clientX: 52, clientY: 50 });
    expect(setPointerCapture).not.toHaveBeenCalled();

    fireEvent.pointerMove(widget(), { pointerId: 1, buttons: 1, clientX: 90, clientY: 50 });
    fireEvent.pointerMove(widget(), { pointerId: 1, buttons: 1, clientX: 130, clientY: 50 });
    expect(setPointerCapture).toHaveBeenCalledTimes(1);
  });

  it("returns where a cancelled drag left it without swallowing the next click", () => {
    renderWidget();

    fireEvent.pointerDown(widget(), { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(widget(), { pointerId: 1, buttons: 1, clientX: 120, clientY: 90 });
    fireEvent.pointerCancel(widget(), { pointerId: 1 });

    expect(clickGoesThrough()).toBe(true);
  });

  it("does not drag below its floating query", () => {
    stubViewport(false);
    renderWidget({ floatingQuery: "(min-width: 64rem)" });

    drag(widget(), [50, 50], [120, 90]);

    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 64rem)");
    expect(widget().style.left).toBe("");
    expect(clickGoesThrough()).toBe(true);
  });
});
