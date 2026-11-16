import { isMarginSide, spacingLabel, spacingToken, spacingValue } from "./spacing";

describe("spacingValue", () => {
  it("resolves positive and negative keys", () => {
    expect(spacingValue("4")).toBe("1rem");
    expect(spacingValue("-4")).toBe("-1rem");
    expect(spacingValue("\u22124")).toBe("-1rem");
    expect(spacingValue("0")).toBe("0");
  });

  it("returns undefined for empty, unknown or -0 keys", () => {
    expect(spacingValue()).toBeUndefined();
    expect(spacingValue("")).toBeUndefined();
    expect(spacingValue("-")).toBeUndefined();
    expect(spacingValue("-0")).toBeUndefined();
    expect(spacingValue("999")).toBeUndefined();
  });

  it("ignores keys inherited from the prototype", () => {
    expect(spacingValue("constructor")).toBeUndefined();
    expect(spacingValue("-toString")).toBeUndefined();
    expect(spacingLabel("__proto__")).toBe("__proto__");
  });
});

describe("spacingToken", () => {
  it("turns the CMS minus into the token's hyphen", () => {
    expect(spacingToken("\u22124")).toBe("-4");
    expect(spacingToken("-4")).toBe("-4");
    expect(spacingToken("4")).toBe("4");
    expect(spacingToken(undefined)).toBeUndefined();
  });
});

describe("spacingLabel", () => {
  it("appends the CSS length", () => {
    expect(spacingLabel("4")).toBe("4 (1rem)");
    expect(spacingLabel("\u22124")).toBe("\u22124 (\u22121rem)");
  });

  it("keeps unknown keys bare", () => {
    expect(spacingLabel("999")).toBe("999");
  });
});

describe("isMarginSide", () => {
  it("accepts margins only", () => {
    expect(["mt", "mb", "ml", "mr"].every(isMarginSide)).toBe(true);
    expect(["pt", "pb", "pl", "pr", "gap"].some(isMarginSide)).toBe(false);
  });
});
