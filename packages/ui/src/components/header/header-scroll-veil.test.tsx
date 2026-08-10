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

function veil() {
  return screen.getByTestId("header-scroll-veil");
}

function progress() {
  return veil().style.getPropertyValue("--veil-progress");
}

function blur() {
  return veil().style.getPropertyValue("--veil-blur");
}

describe("HeaderScrollVeil", () => {
  it("is hidden from assistive tech and starts fully transparent", () => {
    render(<HeaderScrollVeil />);

    expect(veil()).toHaveAttribute("aria-hidden", "true");
    expect(progress()).toBe("0.000");
    expect(blur()).toBe("0.000");
    expect(veil().dataset.veilIdle).toBe("true");
  });

  it("ramps the tint in linearly with scroll and clamps at 1", () => {
    render(<HeaderScrollVeil />);

    scrollTo(80);
    expect(progress()).toBe("0.500");
    expect(veil().dataset.veilIdle).toBe("false");

    scrollTo(160);
    expect(progress()).toBe("1.000");

    scrollTo(4000);
    expect(progress()).toBe("1.000");
  });

  it("eases the blur radius in behind the tint", () => {
    render(<HeaderScrollVeil />);

    // Squared ramp: the first pixels of scroll barely blur at all.
    scrollTo(16);
    expect(blur()).toBe("0.010");

    scrollTo(80);
    expect(blur()).toBe("0.250");

    scrollTo(160);
    expect(blur()).toBe("1.000");
  });

  it("picks up the scroll position already in place on mount", () => {
    vi.stubGlobal("scrollY", 160);

    render(<HeaderScrollVeil />);

    expect(progress()).toBe("1.000");
    expect(blur()).toBe("1.000");
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
