import { describe, expect, it } from "vitest";

import {
  getVimeoId,
  getYouTubeId,
  resolveAspectRatio,
  resolveMediaAspectRatio,
  toDimension,
} from "./lib";

describe("getYouTubeId", () => {
  it("extracts an id from a watch url", () => {
    expect(getYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("accepts a bare 11-character id", () => {
    expect(getYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
});

describe("getVimeoId", () => {
  it("extracts a numeric id from a vimeo url", () => {
    expect(getVimeoId("https://vimeo.com/123456789")).toBe("123456789");
  });

  it("accepts a bare numeric id", () => {
    expect(getVimeoId("987654321")).toBe("987654321");
  });
});

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
