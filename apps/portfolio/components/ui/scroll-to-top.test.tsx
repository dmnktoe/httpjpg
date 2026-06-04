import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let currentPathname: string;

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

import { ScrollToTop } from "./scroll-to-top";

describe("ScrollToTop", () => {
  beforeEach(() => {
    currentPathname = "/";
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing", () => {
    const { container } = render(<ScrollToTop />);
    expect(container).toBeEmptyDOMElement();
  });

  it("scrolls to the top on mount", () => {
    render(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  it("scrolls again when the pathname changes", () => {
    const { rerender } = render(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    currentPathname = "/work/example";
    rerender(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });
});
