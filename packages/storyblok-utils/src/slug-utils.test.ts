import { describe, expect, it } from "@jest/globals";
import { isSlugExcludedFromRouting } from "./slug-utils";

describe("Slug Utils", () => {
  describe("isSlugExcludedFromRouting", () => {
    it("should exclude config folders", () => {
      expect(isSlugExcludedFromRouting("_config/settings")).toBe(true);
      expect(isSlugExcludedFromRouting("pages/_config/layout")).toBe(true);
    });

    it("should exclude component folders", () => {
      expect(isSlugExcludedFromRouting("_components/header")).toBe(true);
      expect(isSlugExcludedFromRouting("site/_components/footer")).toBe(true);
    });

    it("should exclude layout folders", () => {
      expect(isSlugExcludedFromRouting("_layouts/default")).toBe(true);
      expect(isSlugExcludedFromRouting("templates/_layouts/blog")).toBe(true);
    });

    it("should not exclude normal slugs", () => {
      expect(isSlugExcludedFromRouting("about-us")).toBe(false);
      expect(isSlugExcludedFromRouting("blog/my-post")).toBe(false);
      expect(isSlugExcludedFromRouting("products/category/item")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isSlugExcludedFromRouting("")).toBe(false);
      expect(isSlugExcludedFromRouting("_config")).toBe(true);
      expect(isSlugExcludedFromRouting("config")).toBe(false);
    });
  });
});
