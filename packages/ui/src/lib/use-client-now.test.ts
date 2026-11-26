import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { useClientNow } from "./use-client-now";

function Probe() {
  return String(useClientNow());
}

describe("useClientNow", () => {
  it("is 0 on the server", () => {
    expect(renderToString(createElement(Probe))).toBe("0");
  });

  it("is the mount time on the client, shared by every caller", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1000);
    const first = renderHook(() => useClientNow());
    vi.setSystemTime(5000);
    const second = renderHook(() => useClientNow());

    expect(first.result.current).toBe(1000);
    expect(second.result.current).toBe(1000);

    first.unmount();
    second.unmount();
    const third = renderHook(() => useClientNow());
    expect(third.result.current).toBe(5000);
    third.unmount();
    vi.useRealTimers();
  });
});
