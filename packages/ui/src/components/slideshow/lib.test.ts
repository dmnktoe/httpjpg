import { resolveSlideIndex, slideshowNavigationMode } from "./lib";

describe("slideshowNavigationMode", () => {
  it("disables loop and rewind for a single slide", () => {
    expect(slideshowNavigationMode("slide", 1)).toEqual({ loop: false, rewind: false });
  });

  it("uses rewind instead of loop for multiple slides", () => {
    expect(slideshowNavigationMode("slide", 3)).toEqual({ loop: false, rewind: true });
    expect(slideshowNavigationMode("fade", 3)).toEqual({ loop: false, rewind: true });
    expect(slideshowNavigationMode("cube", 3)).toEqual({ loop: false, rewind: true });
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
