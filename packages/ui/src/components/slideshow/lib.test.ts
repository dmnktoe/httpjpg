import { isNearActive, resolveAnimation } from "./lib";

describe("resolveAnimation", () => {
  it("treats a missing or empty value as none", () => {
    expect(resolveAnimation()).toBe("none");
    expect(resolveAnimation("")).toBe("none");
  });

  it("passes through a real animation name", () => {
    expect(resolveAnimation("sharpen")).toBe("sharpen");
    expect(resolveAnimation("none")).toBe("none");
  });
});

describe("isNearActive", () => {
  it("includes the active slide and its immediate neighbours, wrapping", () => {
    expect(isNearActive(0, 0, 5)).toBe(true);
    expect(isNearActive(1, 0, 5)).toBe(true);
    expect(isNearActive(4, 0, 5)).toBe(true);
    expect(isNearActive(2, 0, 5)).toBe(false);
  });
});
