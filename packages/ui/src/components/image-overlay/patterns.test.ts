import { OVERLAY_PATTERNS, pickPattern } from "./patterns";

describe("pickPattern", () => {
  it("returns the same pattern for the same seed", () => {
    expect(pickPattern("foo")).toBe(pickPattern("foo"));
    expect(pickPattern("bar")).toBe(pickPattern("bar"));
  });

  it("falls back to a deterministic default for an empty seed", () => {
    expect(pickPattern("")).toBe(pickPattern(""));
    expect(pickPattern(undefined)).toBe(pickPattern(undefined));
  });

  it("only returns valid pattern keys", () => {
    const keys = Object.keys(OVERLAY_PATTERNS);
    for (const seed of ["a", "abc", "https://example/foo.jpg", "12345"]) {
      expect(keys).toContain(pickPattern(seed));
    }
  });

  it("spreads different seeds across multiple patterns", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      seen.add(pickPattern(`seed-${i}`));
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
