import { describe, expect, it } from "@jest/globals";
import { getProcessedImage } from "./image-processing";

describe("Image Processing", () => {
  const baseUrl = "https://a.storyblok.com/f/12345/image.jpg";

  describe("getProcessedImage", () => {
    it("should return empty string for empty imageSrc", () => {
      expect(getProcessedImage("")).toBe("");
      expect(getProcessedImage()).toBe("");
    });

    it("should add basic webp conversion with quality filter", () => {
      const result = getProcessedImage(baseUrl);
      expect(result).toBe(`${baseUrl}/m/filters:quality(75)`);
    });

    it("should apply crop dimensions", () => {
      const result = getProcessedImage(baseUrl, "600x400");
      expect(result).toBe(`${baseUrl}/m/600x400/filters:quality(75)`);
    });

    it("should apply focal point when crop and focus provided", () => {
      const result = getProcessedImage(baseUrl, "600x400", "300x200:301x201");
      expect(result).toBe(
        `${baseUrl}/m/600x400/filters:quality(75):focal(300x200:600x400)`,
      );
    });

    it("should append additional filters", () => {
      const result = getProcessedImage(
        baseUrl,
        "600x400",
        "",
        "blur(10):grayscale()",
      );
      expect(result).toBe(
        `${baseUrl}/m/600x400/filters:quality(75):blur(10):grayscale()`,
      );
    });

    it("should combine all parameters", () => {
      const result = getProcessedImage(
        baseUrl,
        "800x600",
        "400x300:401x301",
        "brightness(110)",
      );
      expect(result).toContain("/m/800x600");
      expect(result).toContain("quality(75)");
      expect(result).toContain("focal(400x300:800x600)");
      expect(result).toContain("brightness(110)");
    });

    it("should handle filters without crop", () => {
      const result = getProcessedImage(baseUrl, "", "", "blur(5)");
      expect(result).toBe(`${baseUrl}/m/filters:quality(75):blur(5)`);
    });

    it("should return external URLs as-is without processing", () => {
      const externalUrl = "https://example.com/image.jpg";
      const result = getProcessedImage(externalUrl);
      expect(result).toBe(externalUrl);
    });

    it("should return external HTTP URLs as-is without processing", () => {
      const externalUrl = "http://example.com/image.jpg";
      const result = getProcessedImage(externalUrl);
      expect(result).toBe(externalUrl);
    });

    it("should process Storyblok URLs even if they start with https", () => {
      const storyblokUrl = "https://a.storyblok.com/f/12345/image.jpg";
      const result = getProcessedImage(storyblokUrl, "600x400");
      expect(result).toContain("/m/600x400");
      expect(result).toContain("filters:quality(75)");
    });

    it("should not process external URLs with crop parameters", () => {
      const externalUrl = "https://cdn.example.com/photo.png";
      const result = getProcessedImage(externalUrl, "800x600");
      expect(result).toBe(externalUrl);
      expect(result).not.toContain("/m/");
    });
  });
});
