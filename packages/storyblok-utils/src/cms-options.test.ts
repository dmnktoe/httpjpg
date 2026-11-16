import { spacing } from "@httpjpg/tokens";

import { CMS_OPTIONS } from "./cms-options";

describe("CMS_OPTIONS.margin", () => {
  it("includes every positive spacing key", () => {
    for (const key of CMS_OPTIONS.spacing) {
      expect(CMS_OPTIONS.margin).toContain(key);
    }
  });

  it("includes a signed counterpart for every non-zero spacing key", () => {
    for (const key of CMS_OPTIONS.spacing) {
      if (key === "0") {
        continue;
      }
      expect(CMS_OPTIONS.margin).toContain(`\u2212${key}`);
    }
  });

  it("does not add a negative zero", () => {
    expect(CMS_OPTIONS.margin).not.toContain("\u22120");
  });

  it("lists the positive scale first, then the negatives from smallest to largest pull", () => {
    const positives = Object.keys(spacing);
    expect(CMS_OPTIONS.margin.slice(0, positives.length)).toEqual(positives);
    expect(CMS_OPTIONS.margin[0]).toBe("0");
    expect(CMS_OPTIONS.margin[positives.length]).toBe("\u22121");
    expect(CMS_OPTIONS.margin.at(-1)).toBe("\u221296");
  });
});
