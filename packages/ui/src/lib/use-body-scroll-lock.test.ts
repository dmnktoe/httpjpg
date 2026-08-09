import { renderHook } from "@testing-library/react";

import { useBodyScrollLock } from "./use-body-scroll-lock";

function clearBodyStyles() {
  document.body.removeAttribute("style");
}

beforeEach(() => {
  clearBodyStyles();
  window.scrollTo(0, 0);
});

afterEach(() => {
  clearBodyStyles();
});

describe("useBodyScrollLock", () => {
  it("does nothing while unlocked", () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.position).toBe("");
  });

  it("takes the body out of flow, which is what actually stops the page", () => {
    renderHook(() => useBodyScrollLock(true));

    // `overflow: hidden` alone cannot work: globals.css sets overflow-x on
    // <html>, so the body's overflow never reaches the viewport.
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.overscrollBehavior).toBe("none");
  });

  it("holds the page at its scroll offset and restores it on release", () => {
    window.scrollY = 420;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.top).toBe("-420px");

    unmount();

    expect(document.body.style.position).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(0, 420);
    scrollTo.mockRestore();
    window.scrollY = 0;
  });

  it("stays locked until the last holder releases", () => {
    const menu = renderHook(() => useBodyScrollLock(true));
    const palette = renderHook(() => useBodyScrollLock(true));

    menu.unmount();
    expect(document.body.style.position).toBe("fixed");

    palette.unmount();
    expect(document.body.style.position).toBe("");
  });

  it("does not capture a scroll offset taken after the body was already fixed", () => {
    window.scrollY = 300;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const menu = renderHook(() => useBodyScrollLock(true));
    // A second holder arriving while the body is fixed would read scrollY as 0.
    window.scrollY = 0;
    const palette = renderHook(() => useBodyScrollLock(true));

    palette.unmount();
    menu.unmount();

    expect(scrollTo).toHaveBeenCalledWith(0, 300);
    scrollTo.mockRestore();
  });

  it("restores whatever the page had set before the first lock", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    unmount();

    expect(document.body.style.overflow).toBe("scroll");
  });
});
