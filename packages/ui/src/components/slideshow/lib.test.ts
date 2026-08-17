import { resolveSlideIndex, supportsLoop } from "./lib";

describe("supportsLoop", () => {
  it("allows loop for slide-style effects", () => {
    expect(supportsLoop("slide")).toBe(true);
    expect(supportsLoop("cube")).toBe(true);
  });

  it("disables loop for fade", () => {
    expect(supportsLoop("fade")).toBe(false);
  });
});

describe("resolveSlideIndex", () => {
  it("reads realIndex in loop mode", () => {
    expect(
      resolveSlideIndex({ params: { loop: true }, realIndex: 2, activeIndex: 4 }),
    ).toBe(2);
  });

  it("reads activeIndex when loop is off", () => {
    expect(
      resolveSlideIndex({ params: { loop: false }, realIndex: 2, activeIndex: 1 }),
    ).toBe(1);
  });
});
