import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { HeaderScrollVeil } from "./header-scroll-veil";

let frames: FrameRequestCallback[] = [];

beforeEach(() => {
  frames = [];
  vi.stubGlobal("scrollY", 0);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function scrollTo(y: number) {
  vi.stubGlobal("scrollY", y);
  fireEvent.scroll(window);
  const queued = frames;
  frames = [];
  for (const frame of queued) {
    frame(0);
  }
}

function progress() {
  return screen.getByTestId("header-scroll-veil").style.getPropertyValue("--veil-progress");
}

describe("HeaderScrollVeil", () => {
  it("is hidden from assistive tech and starts fully transparent", () => {
    render(<HeaderScrollVeil />);

    const veil = screen.getByTestId("header-scroll-veil");
    expect(veil).toHaveAttribute("aria-hidden", "true");
    expect(progress()).toBe("0.000");
  });

  it("ramps in linearly with scroll and clamps at 1", () => {
    render(<HeaderScrollVeil />);

    scrollTo(60);
    expect(progress()).toBe("0.500");

    scrollTo(120);
    expect(progress()).toBe("1.000");

    scrollTo(4000);
    expect(progress()).toBe("1.000");
  });

  it("picks up the scroll position already in place on mount", () => {
    vi.stubGlobal("scrollY", 120);

    render(<HeaderScrollVeil />);

    expect(progress()).toBe("1.000");
  });

  it("drops its scroll listeners on unmount", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<HeaderScrollVeil />);
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

    removeEventListener.mockRestore();
  });
});
