import { truncate } from "./lib";

describe("truncate", () => {
  it("leaves a text that fits alone", () => {
    expect(truncate("Night Drive", 40)).toBe("Night Drive");
  });

  it("cuts to the limit and marks the cut", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
  });

  it("drops the trailing space rather than stranding it before the ellipsis", () => {
    expect(truncate("ab cdef", 4)).toBe("ab…");
  });

  it("counts an emoji once and keeps it whole at the boundary", () => {
    const label = `${"a".repeat(38)}😀tail`;

    const cut = truncate(label, 40);

    expect(cut).toBe(`${"a".repeat(38)}😀…`);
    expect(cut).not.toMatch(/[\uD800-\uDFFF]/u);
  });
});
