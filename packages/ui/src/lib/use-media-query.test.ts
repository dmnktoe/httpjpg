import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { useMediaQuery } from "./use-media-query";

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches,
    addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: () => void) => listeners.delete(listener)),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  return {
    media,
    set(next: boolean) {
      media.matches = next;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("follows the query", () => {
    const stub = stubMatchMedia(false);
    const { result, unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
    expect(result.current).toBe(false);

    act(() => stub.set(true));
    expect(result.current).toBe(true);

    unmount();
    expect(stub.media.removeEventListener).toHaveBeenCalled();
  });

  it("does not know on the server", () => {
    function Probe() {
      return createElement("span", null, String(useMediaQuery("(min-width: 768px)")));
    }

    expect(renderToString(createElement(Probe))).toContain("null");
  });

  it("does not know where the browser cannot tell", () => {
    vi.stubGlobal("matchMedia", undefined);

    expect(renderHook(() => useMediaQuery("(min-width: 768px)")).result.current).toBeNull();
  });
});
