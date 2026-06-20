import { editableAttrs, sizesFromWidths, spacingCss, widthCss } from "./use-blok";

describe("spacingCss", () => {
  it("returns an empty object when no spacing is set", () => {
    expect(spacingCss({ _uid: "1" } as never)).toEqual({});
  });

  it("maps a single-breakpoint axis to a plain value", () => {
    expect(spacingCss({ mt: "4" } as never)).toEqual({ mt: "4" });
  });

  it("builds a responsive object and fills gaps from smaller breakpoints", () => {
    expect(spacingCss({ pt: "2", ptMd: "4", ptLg: "8" } as never)).toEqual({
      pt: { base: "2", md: "4", lg: "8" },
    });
  });

  it("inherits md/lg from base when only base + lg are set", () => {
    expect(spacingCss({ mb: "2", mbLg: "8" } as never)).toEqual({
      mb: { base: "2", md: "2", lg: "8" },
    });
  });
});

describe("widthCss", () => {
  it("returns an empty object when no width is set", () => {
    expect(widthCss({})).toEqual({});
  });

  it("returns a plain width when only the base is set", () => {
    expect(widthCss({ width: "50%" })).toEqual({ width: "50%" });
  });

  it("returns a responsive width object across breakpoints", () => {
    expect(widthCss({ width: "100%", widthMd: "50%", widthLg: "33%" })).toEqual({
      width: { base: "100%", md: "50%", lg: "33%" },
    });
  });
});

describe("sizesFromWidths", () => {
  it("defaults to 100vw when no width is provided", () => {
    expect(sizesFromWidths({})).toBe("100vw");
  });

  it("converts percentages to vw and orders breakpoints largest-first", () => {
    expect(sizesFromWidths({ width: "100%", widthMd: "50%", widthLg: "33%" })).toBe(
      "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
    );
  });
});

describe("editableAttrs", () => {
  it("returns an object for a blok with a _uid", () => {
    expect(editableAttrs({ _uid: "abc" })).toBeTypeOf("object");
  });
});
