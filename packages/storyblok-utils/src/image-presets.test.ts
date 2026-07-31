import { imagePreset } from "./image-presets";

const filename = "https://a.storyblok.com/f/1/photo.jpg";

describe("imagePreset", () => {
  it("returns an empty string when no filename is given", () => {
    expect(imagePreset.og(undefined)).toBe("");
    expect(imagePreset.thumb(undefined)).toBe("");
    expect(imagePreset.blur(undefined)).toBe("");
  });

  it("builds an Open Graph 1200x630 smart crop", () => {
    const result = imagePreset.og(filename);
    expect(result).toContain("/m/1200x630/smart");
  });

  it("builds a 200px wide thumbnail", () => {
    expect(imagePreset.thumb(filename)).toContain("/m/200x0");
  });

  it("builds a 20px blur placeholder", () => {
    expect(imagePreset.blur(filename)).toContain("/m/20x0");
  });

  it("threads a focus point through the transform", () => {
    expect(imagePreset.og(filename, "100x100:101x101")).toContain("focal(");
  });

  it("strips the crop mode from the focal filter dimensions", () => {
    expect(imagePreset.og(filename, "100x100:101x101")).toContain("focal(100x100:1200x630)");
  });
});
