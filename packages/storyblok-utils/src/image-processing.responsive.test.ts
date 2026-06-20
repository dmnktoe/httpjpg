import { getResponsiveImage } from "./image-processing";

const baseUrl = "https://a.storyblok.com/f/12345/image.jpg";

describe("getResponsiveImage", () => {
  it("returns empty src and srcSet for empty input", () => {
    expect(getResponsiveImage("")).toEqual({ src: "", srcSet: "" });
  });

  it("returns external URLs unchanged with no srcSet", () => {
    const external = "https://example.com/image.jpg";
    expect(getResponsiveImage(external)).toEqual({ src: external, srcSet: "" });
  });

  it("builds a srcSet across the default widths", () => {
    const { src, srcSet } = getResponsiveImage(baseUrl);
    expect(src).toContain("/m/2560x0");
    expect(srcSet).toContain("640w");
    expect(srcSet).toContain("2560w");
  });

  it("uses custom widths when provided", () => {
    const { srcSet } = getResponsiveImage(baseUrl, { widths: [320, 640] });
    expect(srcSet).toContain("320w");
    expect(srcSet).toContain("640w");
    expect(srcSet).not.toContain("2560w");
  });

  it("applies an aspect ratio to compute heights", () => {
    const { src } = getResponsiveImage(baseUrl, { widths: [1000], aspectRatio: "2/1" });
    expect(src).toContain("/m/1000x500");
  });

  it("ignores an invalid aspect ratio and falls back to auto height", () => {
    const { src } = getResponsiveImage(baseUrl, { widths: [800], aspectRatio: "abc" });
    expect(src).toContain("/m/800x0");
  });

  it("treats an 'auto' aspect ratio as no fixed height", () => {
    const { src } = getResponsiveImage(baseUrl, { widths: [800], aspectRatio: "auto" });
    expect(src).toContain("/m/800x0");
  });
});
