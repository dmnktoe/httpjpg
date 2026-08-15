import { renderHook } from "@testing-library/react";

import {
  isBodyScrollLocked,
  subscribeBodyScrollLock,
  useBodyScrollLock,
} from "./use-body-scroll-lock";

function clearInlineStyles() {
  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("style");
}

beforeEach(() => {
  clearInlineStyles();
  window.scrollTo(0, 0);
});

afterEach(() => {
  clearInlineStyles();
});

describe("useBodyScrollLock", () => {
  it("does nothing while unlocked", () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.position).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("takes the body out of flow, which is what actually stops the page", () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe("100%");
  });

  it("locks the viewport from the root element, where it propagates", () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overscrollBehavior).toBe("none");
  });

  it("leaves the body a normal box so sticky descendants keep their anchor", () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe("");
  });

  it("holds the page at its scroll offset and restores it on release", () => {
    window.scrollY = 420;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.top).toBe("-420px");

    unmount();

    expect(document.body.style.position).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
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

  it("pulls the held offset back into the document after a rotation", () => {
    window.scrollY = 2000;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const scrollHeight = vi
      .spyOn(document.body, "scrollHeight", "get")
      .mockReturnValue(window.innerHeight + 500);

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.top).toBe("-2000px");

    window.dispatchEvent(new Event("orientationchange"));

    expect(document.body.style.top).toBe("-500px");

    unmount();
    expect(scrollTo).toHaveBeenCalledWith(0, 500);

    scrollHeight.mockRestore();
    scrollTo.mockRestore();
    window.scrollY = 0;
  });

  it("keeps re-clamping while a second overlay still holds the lock", () => {
    window.scrollY = 2000;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const scrollHeight = vi
      .spyOn(document.body, "scrollHeight", "get")
      .mockReturnValue(window.innerHeight + 500);

    const menu = renderHook(() => useBodyScrollLock(true));
    const palette = renderHook(() => useBodyScrollLock(true));

    menu.unmount();
    window.dispatchEvent(new Event("resize"));

    expect(document.body.style.top).toBe("-500px");

    palette.unmount();
    scrollHeight.mockRestore();
    scrollTo.mockRestore();
    window.scrollY = 0;
  });

  it("lifts the held offset again once the document has room for it", () => {
    window.scrollY = 2000;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const scrollHeight = vi
      .spyOn(document.body, "scrollHeight", "get")
      .mockReturnValue(window.innerHeight + 500);

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    window.dispatchEvent(new Event("resize"));
    expect(document.body.style.top).toBe("-500px");

    scrollHeight.mockReturnValue(window.innerHeight + 3000);
    window.dispatchEvent(new Event("resize"));

    expect(document.body.style.top).toBe("-2000px");

    unmount();
    expect(scrollTo).toHaveBeenCalledWith(0, 2000);
    scrollHeight.mockRestore();
    scrollTo.mockRestore();
    window.scrollY = 0;
  });

  it("restores whatever the page had set before the first lock", () => {
    document.documentElement.style.overflow = "scroll";
    document.body.style.position = "relative";

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    unmount();

    expect(document.documentElement.style.overflow).toBe("scroll");
    expect(document.body.style.position).toBe("relative");
  });

  it("reports locked before freeze mutates the body, so scroll listeners skip the jump", () => {
    const listener = vi.fn(() => {
      expect(isBodyScrollLocked()).toBe(true);
      expect(document.body.style.position).toBe("");
    });
    const unsubscribe = subscribeBodyScrollLock(listener);

    const { unmount } = renderHook(() => useBodyScrollLock(true));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(document.body.style.position).toBe("fixed");
    unsubscribe();
    unmount();
  });

  it("notifies subscribers when the first holder locks and the last one releases", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeBodyScrollLock(listener);

    const menu = renderHook(() => useBodyScrollLock(true));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(isBodyScrollLocked()).toBe(true);

    const palette = renderHook(() => useBodyScrollLock(true));
    expect(listener).toHaveBeenCalledTimes(1);

    palette.unmount();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(isBodyScrollLocked()).toBe(true);

    menu.unmount();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(isBodyScrollLocked()).toBe(false);

    unsubscribe();
  });
});
