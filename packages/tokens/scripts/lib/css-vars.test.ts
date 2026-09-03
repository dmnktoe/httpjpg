// @vitest-environment node
import { generateCSSVariables, renderTokensCss, toKebabCase } from "./css-vars";

describe("toKebabCase", () => {
  it("splits camelCase and lowercases", () => {
    expect(toKebabCase("accent500")).toBe("accent500");
    expect(toKebabCase("fontSize")).toBe("font-size");
  });
});

describe("generateCSSVariables", () => {
  it("emits a leaf as a prefixed custom property", () => {
    expect(generateCSSVariables({ 500: "#000" }, "color", "black")).toBe(
      "\t--color-black-500: #000;",
    );
  });

  it("walks nested objects", () => {
    const css = generateCSSVariables({ accent: { 500: "#f0f" } }, "color");
    expect(css).toBe("\t--color-accent-500: #f0f;");
  });
});

describe("renderTokensCss", () => {
  it("wraps the four token maps in :root", () => {
    const css = renderTokensCss({
      colors: { black: "#000" },
      spacing: { 4: "1rem" },
      borderRadius: { none: "0" },
      shadows: { sm: "none" },
    });

    expect(css).toContain(":root {");
    expect(css).toContain("--color-black: #000;");
    expect(css).toContain("--spacing-4: 1rem;");
    expect(css).toContain("--radius-none: 0;");
    expect(css).toContain("--shadow-sm: none;");
  });
});
