import { describe, expect, it } from "vitest";

import { resolveAspectRatio, resolveMediaAspectRatio, toDimension } from "./lib";

describe("resolveAspectRatio", () => {
  it("returns undefined for empty and whitespace values", () => {
    expect(resolveAspectRatio()).toBeUndefined();
    expect(resolveAspectRatio("")).toBeUndefined();
    expect(resolveAspectRatio("   ")).toBeUndefined();
  });

  it("returns trimmed ratios", () => {
    expect(resolveAspectRatio("16/9")).toBe("16/9");
    expect(resolveAspectRatio(" 21/9 ")).toBe("21/9");
  });
});

describe("toDimension", () => {
  it("accepts positive numbers and numeric strings", () => {
    expect(toDimension(1920)).toBe(1920);
    expect(toDimension("200")).toBe(200);
  });

  it("rejects invalid values", () => {
    expect(toDimension(0)).toBeUndefined();
    expect(toDimension("")).toBeUndefined();
    expect(toDimension("abc")).toBeUndefined();
  });
});

describe("resolveMediaAspectRatio", () => {
  it("builds a ratio from asset dimensions", () => {
    expect(resolveMediaAspectRatio(1920, 200)).toBe("1920/200");
  });

  it("returns undefined when either dimension is missing", () => {
    expect(resolveMediaAspectRatio(1920)).toBeUndefined();
    expect(resolveMediaAspectRatio(undefined, 200)).toBeUndefined();
  });
});
