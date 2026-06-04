import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeSync } from "./theme-sync";

describe("ThemeSync", () => {
  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.theme;
  });

  it("renders nothing", () => {
    const { container } = render(<ThemeSync theme="light" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("syncs the theme onto the html element", () => {
    render(<ThemeSync theme="dark" />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("updates the attribute when the theme prop changes", () => {
    const { rerender } = render(<ThemeSync theme="light" />);
    expect(document.documentElement.dataset.theme).toBe("light");

    rerender(<ThemeSync theme="dark" />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
