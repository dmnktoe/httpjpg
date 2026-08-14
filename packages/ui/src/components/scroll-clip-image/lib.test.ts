import { getEntryProgress, getPinProgress } from "./lib";

function rect(top: number, height: number): DOMRect {
  return { top, height, bottom: top + height } as DOMRect;
}

describe("getEntryProgress", () => {
  it("is 0 when the element top sits at the bottom of the viewport", () => {
    expect(getEntryProgress(rect(800, 400), 800)).toBe(0);
  });

  it("is 1 when the element center meets the viewport center", () => {
    expect(getEntryProgress(rect(200, 400), 800)).toBe(1);
  });

  it("clamps past the settled point", () => {
    expect(getEntryProgress(rect(-100, 400), 800)).toBe(1);
  });
});

describe("getPinProgress", () => {
  it("is 0 while the tracker has not reached the top", () => {
    expect(getPinProgress(rect(40, 1600), 800)).toBe(0);
  });

  it("is 1 once the tracker bottom has cleared the viewport", () => {
    expect(getPinProgress(rect(-900, 1600), 800)).toBe(1);
  });

  it("is 1 when the tracker is shorter than the viewport", () => {
    expect(getPinProgress(rect(0, 400), 800)).toBe(1);
  });
});
