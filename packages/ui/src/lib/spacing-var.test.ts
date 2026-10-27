import { responsiveSpacingVars, spacingVar } from "./spacing-var";

describe("spacingVar", () => {
  it("resolves spacing keys to their token variable", () => {
    expect(spacingVar("24")).toBe("var(--jpg-spacing-24)");
    expect(spacingVar(4)).toBe("var(--jpg-spacing-4)");
    expect(spacingVar("0")).toBe("var(--jpg-spacing-0)");
  });

  it("keeps the calc() of a negative token", () => {
    expect(spacingVar("-4")).toBe("calc(var(--jpg-spacing-4) * -1)");
  });

  it("passes raw lengths through and turns off-scale numbers into pixels", () => {
    expect(spacingVar("1rem")).toBe("1rem");
    expect(spacingVar("10%")).toBe("10%");
    expect(spacingVar(13)).toBe("13px");
  });

  it("returns undefined for empty values", () => {
    expect(spacingVar(undefined)).toBeUndefined();
    expect(spacingVar(null)).toBeUndefined();
    expect(spacingVar("")).toBeUndefined();
  });
});

describe("responsiveSpacingVars", () => {
  it("repeats a single value on every breakpoint", () => {
    expect(responsiveSpacingVars("x", 4)).toEqual({
      "--x": "var(--jpg-spacing-4)",
      "--x-md": "var(--jpg-spacing-4)",
      "--x-lg": "var(--jpg-spacing-4)",
    });
  });

  it("carries each breakpoint up to the next one that is unset", () => {
    expect(responsiveSpacingVars("x", { base: "4", lg: "8" })).toEqual({
      "--x": "var(--jpg-spacing-4)",
      "--x-md": "var(--jpg-spacing-4)",
      "--x-lg": "var(--jpg-spacing-8)",
    });
    expect(responsiveSpacingVars("x", { md: "6" })).toEqual({
      "--x": "0",
      "--x-md": "var(--jpg-spacing-6)",
      "--x-lg": "var(--jpg-spacing-6)",
    });
  });

  it("treats null like an unset value instead of throwing", () => {
    expect(responsiveSpacingVars("x", null as never)).toEqual({
      "--x": "0",
      "--x-md": "0",
      "--x-lg": "0",
    });
  });
});
