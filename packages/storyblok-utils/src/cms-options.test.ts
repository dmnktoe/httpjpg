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
      expect(CMS_OPTIONS.margin).toContain(`-${key}`);
    }
  });

  it("does not add a negative zero", () => {
    expect(CMS_OPTIONS.margin).not.toContain("-0");
  });

  it("maps each negative key to the negated token length", () => {
    expect(spacing[4]).toBe("1rem");
    expect(CMS_OPTIONS.margin).toContain("-4");
  });
});
