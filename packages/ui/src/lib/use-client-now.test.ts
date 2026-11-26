import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { useClientNow } from "./use-client-now";

function Probe() {
  return String(useClientNow());
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useClientNow", () => {
  it("is 0 on the server", () => {
    expect(renderToString(createElement(Probe))).toBe("0");
  });

  it("is the current minute on the client, the same for every caller", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const first = renderHook(() => useClientNow());
    vi.setSystemTime(5000);
    const second = renderHook(() => useClientNow());

    expect(first.result.current).toBe(1000);
    expect(second.result.current).toBe(1000);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(first.result.current).toBe(65_000);
    expect(second.result.current).toBe(65_000);
    first.unmount();
    second.unmount();
  });

  it("stops ticking once nobody reads it, and starts fresh afterwards", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const first = renderHook(() => useClientNow());
    first.unmount();
    expect(vi.getTimerCount()).toBe(0);

    vi.setSystemTime(9000);
    const second = renderHook(() => useClientNow());
    expect(second.result.current).toBe(9000);
    second.unmount();
  });
});
