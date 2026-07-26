import { compactSpacing } from "./lib";

describe("compactSpacing", () => {
  it("halves values that sit on the spacing scale", () => {
    expect(compactSpacing(24)).toBe(12);
    expect(compactSpacing(8)).toBe(4);
    expect(compactSpacing("16")).toBe(8);
  });

  it("snaps down to the nearest scale step when the half is off-scale", () => {
    expect(compactSpacing(20)).toBe(10);
    expect(compactSpacing(28)).toBe(14);
    expect(compactSpacing(96)).toBe(48);
    expect(compactSpacing(1)).toBe(0);
  });

  it("passes through values that are not on the scale", () => {
    expect(compactSpacing("2rem")).toBe("2rem");
    expect(compactSpacing("var(--gap)")).toBe("var(--gap)");
    expect(compactSpacing(13)).toBe(13);
  });
});
