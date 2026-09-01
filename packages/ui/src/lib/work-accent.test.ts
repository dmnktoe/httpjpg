import { applyWorkAccent, parseWorkAccent, workAccentCssVars } from "./work-accent";

describe("parseWorkAccent", () => {
  it("returns null for empty, whitespace, and non-hex values", () => {
    expect(parseWorkAccent(undefined)).toBeNull();
    expect(parseWorkAccent(null)).toBeNull();
    expect(parseWorkAccent("")).toBeNull();
    expect(parseWorkAccent("   ")).toBeNull();
    expect(parseWorkAccent("primary.500")).toBeNull();
    expect(parseWorkAccent("#GG0000")).toBeNull();
    expect(parseWorkAccent("ec6839")).toBeNull();
  });

  it("normalises #RGB and #RRGGBB to uppercase #RRGGBB", () => {
    expect(parseWorkAccent("#a3e")?.hex).toBe("#AA33EE");
    expect(parseWorkAccent("#A3E635")?.hex).toBe("#A3E635");
    expect(parseWorkAccent("  #ec6839  ")?.hex).toBe("#EC6839");
  });

  it("picks black glyphs on lime and yellow", () => {
    expect(parseWorkAccent("#A3E635")?.onHex).toBe("#000000");
    expect(parseWorkAccent("#FBBF24")?.onHex).toBe("#000000");
  });

  it("picks white glyphs on terracotta and primary blue (iOS 0.4 threshold)", () => {
    expect(parseWorkAccent("#ec6839")?.onHex).toBe("#ffffff");
    expect(parseWorkAccent("#3B82F6")?.onHex).toBe("#ffffff");
    expect(parseWorkAccent("#000")?.onHex).toBe("#ffffff");
  });
});

describe("workAccentCssVars", () => {
  it("returns undefined without a parsed accent", () => {
    expect(workAccentCssVars(null)).toBeUndefined();
  });

  it("emits fill opacities that match the iOS chrome (0.62 light / 0.7 dark)", () => {
    const accent = parseWorkAccent("#A3E635");
    expect(accent).not.toBeNull();
    expect(workAccentCssVars(accent, false)).toEqual({
      "--work-accent": "#A3E635",
      "--work-on-accent": "#000000",
      "--work-accent-fill": "rgba(163, 230, 53, 0.62)",
      "--work-accent-fill-hover": "rgba(163, 230, 53, 0.78)",
    });
    expect(workAccentCssVars(accent, true)?.["--work-accent-fill"]).toBe("rgba(163, 230, 53, 0.7)");
  });
});

describe("applyWorkAccent", () => {
  it("sets data-work-accent and the CSS variables on the root", () => {
    const root = document.createElement("html");
    applyWorkAccent(root, "#3B82F6", true);
    expect(root.dataset.workAccent).toBe("#3B82F6");
    expect(root.style.getPropertyValue("--work-accent")).toBe("#3B82F6");
    expect(root.style.getPropertyValue("--work-on-accent")).toBe("#ffffff");
  });

  it("clears a previously applied accent", () => {
    const root = document.createElement("html");
    applyWorkAccent(root, "#3B82F6");
    applyWorkAccent(root, null);
    expect(root.dataset.workAccent).toBeUndefined();
    expect(root.style.getPropertyValue("--work-accent")).toBe("");
  });
});
