import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { FEED_EDITOR_COOKIE, useFeedEditor } from "./use-feed-editor";

function clearCookie() {
  document.cookie = `${FEED_EDITOR_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

afterEach(clearCookie);

describe("useFeedEditor", () => {
  it("is false without the marker", () => {
    document.cookie = "other=1; path=/";

    expect(renderHook(() => useFeedEditor()).result.current).toBe(false);
  });

  it("is true once the composer has set its marker", () => {
    document.cookie = `${FEED_EDITOR_COOKIE}=1; path=/`;

    expect(renderHook(() => useFeedEditor()).result.current).toBe(true);
  });

  it("does not take a longer name or another value for the marker", () => {
    document.cookie = `x${FEED_EDITOR_COOKIE}=1; path=/`;
    document.cookie = `${FEED_EDITOR_COOKIE}=10; path=/`;

    expect(renderHook(() => useFeedEditor()).result.current).toBe(false);
  });

  it("is false on the server", () => {
    function Probe() {
      return createElement("span", null, String(useFeedEditor()));
    }

    expect(renderToString(createElement(Probe))).toContain("false");
  });
});
