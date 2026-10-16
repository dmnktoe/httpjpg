import { clampToViewport, hashSeed, scatterPositions } from "./desktop-scatter";

const OPTIONS = { marginX: 4, marginY: 8, right: 32, bottom: 36, minDist: 28 };

describe("hashSeed", () => {
  it("is stable and sensitive to input", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });
});

describe("scatterPositions", () => {
  it("is deterministic for the same ids", () => {
    const ids = ["uid-a", "uid-b", "uid-c"];
    expect(scatterPositions(ids, OPTIONS)).toEqual(scatterPositions(ids, OPTIONS));
  });

  it("keeps every point inside the margins", () => {
    const positions = scatterPositions(["a", "b", "c", "d"], OPTIONS);
    expect(positions).toHaveLength(4);
    for (const { left, top } of positions) {
      expect(left).toBeGreaterThanOrEqual(4);
      expect(left).toBeLessThanOrEqual(100 - 32);
      expect(top).toBeGreaterThanOrEqual(8);
      expect(top).toBeLessThanOrEqual(100 - 36);
    }
  });

  it("returns an empty list for no ids", () => {
    expect(scatterPositions([], OPTIONS)).toEqual([]);
  });
});

describe("clampToViewport", () => {
  const viewport = { width: 800, height: 600 };
  const size = { width: 100, height: 50 };

  it("keeps the whole box inside the viewport margin", () => {
    expect(clampToViewport({ x: -40, y: -10 }, viewport, size, 8)).toEqual({ x: 8, y: 8 });
    expect(clampToViewport({ x: 900, y: 700 }, viewport, size, 8)).toEqual({ x: 692, y: 542 });
  });

  it("pins a box larger than the viewport to the margin", () => {
    expect(clampToViewport({ x: 50, y: 50 }, viewport, { width: 2000, height: 2000 }, 8)).toEqual({
      x: 8,
      y: 8,
    });
  });
});
