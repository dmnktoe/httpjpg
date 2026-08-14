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

  it("is 1 when a taller-than-viewport element is centered", () => {
    expect(getEntryProgress(rect(-600, 2000), 800)).toBe(1);
  });

  it("is 0 when a taller-than-viewport element still sits below the fold", () => {
    expect(getEntryProgress(rect(800, 2000), 800)).toBe(0);
  });
});

describe("getPinProgress", () => {
  it("is 0 while the pin wrapper is still entering", () => {
    expect(getPinProgress(rect(40, 1600), 800)).toBe(0);
  });

  it("is 1 once the wrapper has fully passed", () => {
    expect(getPinProgress(rect(-900, 1600), 800)).toBe(1);
  });

  it("tracks how much of the extra scroll has been consumed", () => {
    expect(getPinProgress(rect(-400, 1600), 800)).toBe(0.5);
  });

  it("is settled when the wrapper is not taller than the viewport", () => {
    expect(getPinProgress(rect(0, 400), 800)).toBe(1);
  });
});
