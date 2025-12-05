import { describe, expect, it } from "@jest/globals";
import {
  clamp,
  getColor,
  getSpacing,
  pxToRem,
  remToPx,
  responsiveSpacing,
} from "./utils";

describe("Token Utils", () => {
  describe("getSpacing", () => {
    it("should return spacing value for valid key", () => {
      expect(getSpacing(4)).toBe("1rem");
      expect(getSpacing(8)).toBe("2rem");
      expect(getSpacing(16)).toBe("4rem");
    });
  });

  describe("getColor", () => {
    it("should return color value for valid path", () => {
      const color = getColor("neutral.500");
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("should return original path if color not found", () => {
      expect(getColor("invalid.path")).toBe("invalid.path");
    });

    it("should handle nested color paths", () => {
      const primary = getColor("primary.600");
      expect(primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe("pxToRem", () => {
    it("should convert px to rem with default base", () => {
      expect(pxToRem(16)).toBe("1rem");
      expect(pxToRem(32)).toBe("2rem");
      expect(pxToRem(8)).toBe("0.5rem");
    });

    it("should convert px to rem with custom base", () => {
      expect(pxToRem(20, 20)).toBe("1rem");
      expect(pxToRem(40, 20)).toBe("2rem");
    });

    it("should handle decimal values", () => {
      expect(pxToRem(12)).toBe("0.75rem");
      expect(pxToRem(24)).toBe("1.5rem");
    });
  });

  describe("remToPx", () => {
    it("should convert rem to px with default base", () => {
      expect(remToPx(1)).toBe(16);
      expect(remToPx(2)).toBe(32);
      expect(remToPx(0.5)).toBe(8);
    });

    it("should convert rem to px with custom base", () => {
      expect(remToPx(1, 20)).toBe(20);
      expect(remToPx(2, 20)).toBe(40);
    });

    it("should handle decimal values", () => {
      expect(remToPx(1.5)).toBe(24);
      expect(remToPx(0.75)).toBe(12);
    });
  });

  describe("clamp", () => {
    it("should generate CSS clamp function", () => {
      expect(clamp("1rem", "2vw", "2rem")).toBe("clamp(1rem, 2vw, 2rem)");
    });

    it("should handle px values", () => {
      expect(clamp("16px", "2vw", "32px")).toBe("clamp(16px, 2vw, 32px)");
    });

    it("should preserve complex preferred values", () => {
      expect(clamp("1rem", "1rem + 2vw", "3rem")).toBe(
        "clamp(1rem, 1rem + 2vw, 3rem)",
      );
    });
  });

  describe("responsiveSpacing", () => {
    it("should generate responsive spacing with default vwScale", () => {
      const result = responsiveSpacing(4, 16);
      expect(result).toContain("clamp");
      expect(result).toContain("1rem"); // 4 = 1rem
      expect(result).toContain("4rem"); // 16 = 4rem
      expect(result).toContain("2vw");
    });

    it("should generate responsive spacing with custom vwScale", () => {
      const result = responsiveSpacing(8, 24, "3vw");
      expect(result).toContain("clamp");
      expect(result).toContain("2rem"); // 8 = 2rem
      expect(result).toContain("6rem"); // 24 = 6rem
      expect(result).toContain("3vw");
    });
  });
});
