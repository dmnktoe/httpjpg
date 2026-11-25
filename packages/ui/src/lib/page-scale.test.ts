import {
  applyPageScale,
  DEFAULT_DESIGN_WIDTHS,
  pageScaleCssVars,
  parsePageScale,
} from "./page-scale";

describe("parsePageScale", () => {
  it("is off unless the page opted in", () => {
    expect(parsePageScale(null)).toBeNull();
    expect(parsePageScale(undefined)).toBeNull();
    expect(parsePageScale({})).toBeNull();
    expect(parsePageScale({ scaleWithViewport: false, designWidth: 1440 })).toBeNull();
    expect(parsePageScale({ scaleWithViewport: "true" })).toBeNull();
  });

  it("uses the default design widths when none are set", () => {
    expect(parsePageScale({ scaleWithViewport: true })).toEqual(DEFAULT_DESIGN_WIDTHS);
  });

  it("reads the widths, as numbers or as the strings Storyblok sends", () => {
    expect(
      parsePageScale({
        scaleWithViewport: true,
        designWidth: 1920,
        designWidthTablet: "1024",
        designWidthMobile: " 430 ",
      }),
    ).toEqual({ desktop: 1920, tablet: 1024, mobile: 430 });
  });

  it.each([
    ["an empty string", ""],
    ["text", "wide"],
    ["a width too small to lay out", 100],
    ["an absurd width", 100_000],
    ["not a number", Number.NaN],
    ["null", null],
  ])("falls back to the default for %s", (_label, value) => {
    expect(parsePageScale({ scaleWithViewport: true, designWidth: value })?.desktop).toBe(
      DEFAULT_DESIGN_WIDTHS.desktop,
    );
  });
});

describe("pageScaleCssVars", () => {
  it("is undefined without a scale", () => {
    expect(pageScaleCssVars(null)).toBeUndefined();
  });

  it("makes 1rem 16px at each band's design width", () => {
    expect(pageScaleCssVars({ desktop: 1600, tablet: 800, mobile: 400 })).toEqual({
      "--page-scale-desktop": "1vw",
      "--page-scale-tablet": "2vw",
      "--page-scale-mobile": "4vw",
    });
    expect(pageScaleCssVars(DEFAULT_DESIGN_WIDTHS)).toEqual({
      "--page-scale-desktop": "1.1111vw",
      "--page-scale-tablet": "1.9185vw",
      "--page-scale-mobile": "4.1026vw",
    });
  });
});

describe("applyPageScale", () => {
  it("marks the root and sets the variables", () => {
    const root = document.createElement("html");

    applyPageScale(root, { desktop: 1600, tablet: 800, mobile: 400 });

    expect(root.dataset.pageScale).toBe("");
    expect(root.style.getPropertyValue("--page-scale-desktop")).toBe("1vw");
    expect(root.style.getPropertyValue("--page-scale-mobile")).toBe("4vw");
  });

  it("clears everything again", () => {
    const root = document.createElement("html");
    applyPageScale(root, DEFAULT_DESIGN_WIDTHS);

    applyPageScale(root, null);

    expect(root.dataset.pageScale).toBeUndefined();
    expect(root.style.getPropertyValue("--page-scale-desktop")).toBe("");
    expect(root.style.getPropertyValue("--page-scale-tablet")).toBe("");
    expect(root.style.getPropertyValue("--page-scale-mobile")).toBe("");
  });
});
