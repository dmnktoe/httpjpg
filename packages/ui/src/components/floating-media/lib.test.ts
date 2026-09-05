import {
  clampFloatingMediaPoint,
  FLOATING_MEDIA_MARGIN,
  floatingMediaAspectRatio,
  floatingMediaKindFromSrc,
  floatingMediaPositions,
  floatingMediaSizesAttr,
  hashSeed,
  resolveFloatingMediaFrameWidth,
  resolveFloatingMediaKind,
  visibleFloatingMedia,
} from "./lib";

describe("floatingMediaKindFromSrc", () => {
  it("sniffs images and videos from the URL", () => {
    expect(floatingMediaKindFromSrc("https://cdn.example/still.png")).toBe("image");
    expect(floatingMediaKindFromSrc("https://cdn.example/reel.mp4?dl=1")).toBe("video");
  });

  it("rejects embeds and unknown paths", () => {
    expect(floatingMediaKindFromSrc("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(floatingMediaKindFromSrc("https://vimeo.com/123")).toBeNull();
    expect(floatingMediaKindFromSrc("https://cdn.example/blob")).toBeNull();
    expect(floatingMediaKindFromSrc("")).toBeNull();
  });
});

describe("resolveFloatingMediaKind", () => {
  it("prefers an explicit kind over the URL", () => {
    expect(
      resolveFloatingMediaKind({
        id: "1",
        name: "Mystery",
        src: "https://cdn.example/blob",
        kind: "video",
      }),
    ).toBe("video");
  });
});

describe("visibleFloatingMedia", () => {
  it("drops blank names, blank srcs, unsafe schemes, and embeds", () => {
    expect(
      visibleFloatingMedia([
        { id: "1", name: "Keep", src: "https://cdn.example/a.png" },
        { id: "2", name: "  ", src: "https://cdn.example/a.png" },
        { id: "3", name: "Nope", src: "" },
        { id: "4", name: "XSS", src: "javascript:alert(1)" },
        { id: "5", name: "YT", src: "https://youtu.be/dQw4w9WgXcQ" },
      ]),
    ).toEqual([{ id: "1", name: "Keep", src: "https://cdn.example/a.png" }]);
  });
});

describe("floatingMediaAspectRatio", () => {
  it("uses intrinsic dimensions when present", () => {
    expect(
      floatingMediaAspectRatio(
        { id: "1", name: "A", src: "/a.png", mediaWidth: 1500, mediaHeight: 2000 },
        "image",
      ),
    ).toBe("1500/2000");
  });

  it("falls back by kind", () => {
    expect(floatingMediaAspectRatio({ id: "1", name: "A", src: "/a.png" }, "image")).toBe("4/3");
    expect(floatingMediaAspectRatio({ id: "1", name: "A", src: "/a.mp4" }, "video")).toBe("16/9");
  });
});

describe("floatingMediaPositions", () => {
  it("is deterministic for the same ids", () => {
    const ids = ["uid-a", "uid-b", "uid-c"];
    expect(floatingMediaPositions(ids)).toEqual(floatingMediaPositions(ids));
  });

  it("returns one point per id inside the padded viewport", () => {
    const positions = floatingMediaPositions(["a", "b"]);
    expect(positions).toHaveLength(2);
    for (const position of positions) {
      expect(position.left).toBeGreaterThanOrEqual(4);
      expect(position.left).toBeLessThanOrEqual(96);
      expect(position.top).toBeGreaterThanOrEqual(8);
      expect(position.top).toBeLessThanOrEqual(92);
    }
  });

  it("returns an empty list for no ids", () => {
    expect(floatingMediaPositions([])).toEqual([]);
  });
});

describe("hashSeed", () => {
  it("is stable and sensitive to input", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
  });
});

describe("clampFloatingMediaPoint", () => {
  it("keeps a point inside the viewport margins", () => {
    expect(clampFloatingMediaPoint(-40, -10, 800, 600, { width: 400, height: 250 })).toEqual({
      x: FLOATING_MEDIA_MARGIN,
      y: FLOATING_MEDIA_MARGIN,
    });
    expect(clampFloatingMediaPoint(900, 700, 800, 600, { width: 400, height: 250 }).x).toBeLessThan(
      800,
    );
  });
});

describe("resolveFloatingMediaFrameWidth", () => {
  it("falls back to 400 when the width is missing or invalid", () => {
    expect(resolveFloatingMediaFrameWidth()).toBe(400);
    expect(resolveFloatingMediaFrameWidth(0)).toBe(400);
    expect(resolveFloatingMediaFrameWidth(240)).toBe(240);
  });
});

describe("floatingMediaSizesAttr", () => {
  it("matches the frame width", () => {
    expect(floatingMediaSizesAttr(240)).toBe("(max-width: 256px) calc(100vw - 16px), 240px");
  });
});
