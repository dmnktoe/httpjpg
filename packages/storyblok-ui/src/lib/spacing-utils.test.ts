import { describe, expect, it } from "@jest/globals";
import { SPACING_SIZES } from "./constants";
import { mapSpacingToToken } from "./spacing-utils";

describe("Spacing Utils", () => {
  describe("mapSpacingToToken", () => {
    it("should return default medium spacing for empty values", () => {
      expect(mapSpacingToToken()).toBe(SPACING_SIZES.medium);
      expect(mapSpacingToToken(null)).toBe(SPACING_SIZES.medium);
      expect(mapSpacingToToken("")).toBe(SPACING_SIZES.medium);
    });

    it("should passthrough direct numeric token values", () => {
      expect(mapSpacingToToken("8")).toBe("8");
      expect(mapSpacingToToken("16")).toBe("16");
      expect(mapSpacingToToken("24")).toBe("24");
      expect(mapSpacingToToken("0")).toBe("0");
    });

    it("should map datasource labels to tokens (case-insensitive)", () => {
      expect(mapSpacingToToken("None")).toBe(SPACING_SIZES.none);
      expect(mapSpacingToToken("XS")).toBe(SPACING_SIZES.xs);
      expect(mapSpacingToToken("Small")).toBe(SPACING_SIZES.small);
      expect(mapSpacingToToken("Medium")).toBe(SPACING_SIZES.medium);
      expect(mapSpacingToToken("Large")).toBe(SPACING_SIZES.large);
      expect(mapSpacingToToken("XL")).toBe(SPACING_SIZES.xl);
      expect(mapSpacingToToken("2XL")).toBe(SPACING_SIZES["2xl"]);
    });

    it("should handle whitespace in labels", () => {
      expect(mapSpacingToToken("  Small  ")).toBe(SPACING_SIZES.small);
      expect(mapSpacingToToken("Medium ")).toBe(SPACING_SIZES.medium);
      expect(mapSpacingToToken(" Large")).toBe(SPACING_SIZES.large);
    });

    it("should normalize label casing", () => {
      expect(mapSpacingToToken("small")).toBe(SPACING_SIZES.small);
      expect(mapSpacingToToken("MEDIUM")).toBe(SPACING_SIZES.medium);
      expect(mapSpacingToToken("LarGe")).toBe(SPACING_SIZES.large);
    });

    it("should handle numeric values from datasource labels", () => {
      // Datasource values like "4 (1rem)", "8 (2rem)" should passthrough the number
      expect(mapSpacingToToken("4")).toBe("4");
      expect(mapSpacingToToken("8")).toBe("8");
      expect(mapSpacingToToken("16")).toBe("16");
    });
  });
});
