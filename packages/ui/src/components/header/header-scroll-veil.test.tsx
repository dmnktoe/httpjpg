import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { isBodyScrollLocked } from "../../lib/use-body-scroll-lock";
import { HeaderScrollVeil } from "./header-scroll-veil";

const lockListeners = new Set<() => void>();

vi.mock("../../lib/use-body-scroll-lock", () => ({
  isBodyScrollLocked: vi.fn(() => false),
  subscribeBodyScrollLock: (listener: () => void) => {
    lockListeners.add(listener);
    return () => {
      lockListeners.delete(listener);
    };
  },
}));

let frames: FrameRequestCallback[] = [];

beforeEach(() => {
  frames = [];
  lockListeners.clear();
  vi.mocked(isBodyScrollLocked).mockReturnValue(false);
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

function setLocked(locked: boolean) {
  vi.mocked(isBodyScrollLocked).mockReturnValue(locked);
  for (const listener of lockListeners) {
    listener();
  }
}

function veil() {
  return screen.getByTestId("header-scroll-veil");
}

function progress() {
  return veil().style.getPropertyValue("--veil-progress");
}

describe("HeaderScrollVeil", () => {
  it("is hidden from assistive tech and starts fully transparent", () => {
    render(<HeaderScrollVeil />);

    expect(veil()).toHaveAttribute("aria-hidden", "true");
    expect(progress()).toBe("0.000");
  });

  it("ramps the tint in linearly with scroll and clamps at 1", () => {
    render(<HeaderScrollVeil />);

    scrollTo(80);
    expect(progress()).toBe("0.500");

    scrollTo(160);
    expect(progress()).toBe("1.000");

    scrollTo(4000);
    expect(progress()).toBe("1.000");
  });

  it("picks up the scroll position already in place on mount", () => {
    vi.stubGlobal("scrollY", 160);

    render(<HeaderScrollVeil />);

    expect(progress()).toBe("1.000");
  });

  it("holds its value while an overlay locks the body scroll", () => {
    vi.stubGlobal("scrollY", 160);
    render(<HeaderScrollVeil />);
    expect(progress()).toBe("1.000");

    vi.mocked(isBodyScrollLocked).mockReturnValue(true);
    scrollTo(0);
    expect(progress()).toBe("1.000");

    vi.mocked(isBodyScrollLocked).mockReturnValue(false);
    scrollTo(160);
    expect(progress()).toBe("1.000");
  });

  it("holds the tint when the lock arrives without a scroll event", () => {
    vi.stubGlobal("scrollY", 160);
    render(<HeaderScrollVeil />);
    expect(progress()).toBe("1.000");

    setLocked(true);
    expect(progress()).toBe("1.000");

    setLocked(false);
    expect(progress()).toBe("1.000");
  });

  it("recomputes from the real scroll position when the lock lifts", () => {
    vi.stubGlobal("scrollY", 160);
    render(<HeaderScrollVeil />);

    setLocked(true);
    vi.stubGlobal("scrollY", 0);
    setLocked(false);

    expect(progress()).toBe("0.000");
  });

  it("drops its scroll listeners on unmount", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<HeaderScrollVeil />);
    expect(lockListeners.size).toBe(1);
    unmount();

    expect(lockListeners.size).toBe(0);
    expect(removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

    removeEventListener.mockRestore();
  });
});
