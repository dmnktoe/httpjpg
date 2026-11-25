import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeSync } from "./theme-sync";

describe("ThemeSync", () => {
  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.workAccent;
    document.documentElement.style.removeProperty("--work-accent");
    document.documentElement.style.removeProperty("--work-on-accent");
    document.documentElement.style.removeProperty("--work-accent-fill");
    document.documentElement.style.removeProperty("--work-accent-fill-hover");
    delete document.documentElement.dataset.pageScale;
    document.documentElement.style.removeProperty("--page-scale-desktop");
    document.documentElement.style.removeProperty("--page-scale-tablet");
    document.documentElement.style.removeProperty("--page-scale-mobile");
  });

  it("scales the root with the viewport on a page that opted in", () => {
    render(<ThemeSync theme="light" scale={{ desktop: 1600, tablet: 800, mobile: 400 }} />);

    expect(document.documentElement.dataset.pageScale).toBe("");
    expect(document.documentElement.style.getPropertyValue("--page-scale-desktop")).toBe("1vw");
  });

  it("follows a changed design width", () => {
    const { rerender } = render(
      <ThemeSync theme="light" scale={{ desktop: 1600, tablet: 800, mobile: 400 }} />,
    );

    rerender(<ThemeSync theme="light" scale={{ desktop: 800, tablet: 800, mobile: 400 }} />);

    expect(document.documentElement.style.getPropertyValue("--page-scale-desktop")).toBe("2vw");
  });

  it("takes its scale with it when the page unmounts", () => {
    const { unmount } = render(
      <ThemeSync theme="light" scale={{ desktop: 1600, tablet: 800, mobile: 400 }} />,
    );

    unmount();

    expect(document.documentElement.dataset.pageScale).toBeUndefined();
    expect(document.documentElement.style.getPropertyValue("--page-scale-desktop")).toBe("");
  });

  it("clears the scale when navigating to a page without one", () => {
    const { rerender } = render(
      <ThemeSync theme="light" scale={{ desktop: 1600, tablet: 800, mobile: 400 }} />,
    );

    rerender(<ThemeSync theme="light" />);

    expect(document.documentElement.dataset.pageScale).toBeUndefined();
    expect(document.documentElement.style.getPropertyValue("--page-scale-desktop")).toBe("");
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

  it("paints work-page chrome variables from the project accent", () => {
    render(<ThemeSync theme="light" accent="#A3E635" />);
    expect(document.documentElement.dataset.workAccent).toBe("#A3E635");
    expect(document.documentElement.style.getPropertyValue("--work-accent")).toBe("#A3E635");
    expect(document.documentElement.style.getPropertyValue("--work-on-accent")).toBe("#000000");
  });

  it("clears a previous accent when navigating off a work page", () => {
    const { rerender } = render(<ThemeSync theme="light" accent="#3B82F6" />);
    expect(document.documentElement.dataset.workAccent).toBe("#3B82F6");

    rerender(<ThemeSync theme="light" />);
    expect(document.documentElement.dataset.workAccent).toBeUndefined();
    expect(document.documentElement.style.getPropertyValue("--work-accent")).toBe("");
  });
});
