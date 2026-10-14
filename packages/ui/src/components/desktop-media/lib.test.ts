import { scatterPositions } from "../../lib/desktop-scatter";
import {
  DESKTOP_MEDIA_SCATTER,
  desktopMediaAspectRatio,
  desktopMediaKindFromSrc,
  desktopMediaSizesAttr,
  resolveDesktopMediaFrameWidth,
  resolveDesktopMediaKind,
  visibleDesktopMedia,
} from "./lib";

describe("desktopMediaKindFromSrc", () => {
  it("sniffs images and videos from the URL", () => {
    expect(desktopMediaKindFromSrc("https://cdn.example/still.png")).toBe("image");
    expect(desktopMediaKindFromSrc("https://cdn.example/reel.mp4?dl=1")).toBe("video");
  });

  it("rejects embeds and unknown paths", () => {
    expect(desktopMediaKindFromSrc("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(desktopMediaKindFromSrc("https://vimeo.com/123")).toBeNull();
    expect(desktopMediaKindFromSrc("https://cdn.example/blob")).toBeNull();
    expect(desktopMediaKindFromSrc("")).toBeNull();
  });
});

describe("resolveDesktopMediaKind", () => {
  it("prefers an explicit kind over the URL", () => {
    expect(
      resolveDesktopMediaKind({
        id: "1",
        name: "Mystery",
        src: "https://cdn.example/blob",
        kind: "video",
      }),
    ).toBe("video");
  });
});

describe("visibleDesktopMedia", () => {
  it("drops blank names, blank srcs, unsafe schemes, and embeds", () => {
    expect(
      visibleDesktopMedia([
        { id: "1", name: "Keep", src: "https://cdn.example/a.png" },
        { id: "2", name: "  ", src: "https://cdn.example/a.png" },
        { id: "3", name: "Nope", src: "" },
        { id: "4", name: "XSS", src: "javascript:alert(1)" },
        { id: "5", name: "YT", src: "https://youtu.be/dQw4w9WgXcQ" },
      ]),
    ).toEqual([{ id: "1", name: "Keep", src: "https://cdn.example/a.png" }]);
  });
});

describe("desktopMediaAspectRatio", () => {
  it("uses intrinsic dimensions when present", () => {
    expect(
      desktopMediaAspectRatio(
        { id: "1", name: "A", src: "/a.png", mediaWidth: 1500, mediaHeight: 2000 },
        "image",
      ),
    ).toBe("1500/2000");
  });

  it("falls back by kind", () => {
    expect(desktopMediaAspectRatio({ id: "1", name: "A", src: "/a.png" }, "image")).toBe("4/3");
    expect(desktopMediaAspectRatio({ id: "1", name: "A", src: "/a.mp4" }, "video")).toBe("16/9");
  });
});

describe("DESKTOP_MEDIA_SCATTER", () => {
  it("keeps windows off the right and bottom edge", () => {
    for (const { left, top } of scatterPositions(["a", "b", "c"], DESKTOP_MEDIA_SCATTER)) {
      expect(left).toBeLessThanOrEqual(68);
      expect(top).toBeLessThanOrEqual(64);
    }
  });
});

describe("resolveDesktopMediaFrameWidth", () => {
  it("falls back to 400 when the width is missing or invalid", () => {
    expect(resolveDesktopMediaFrameWidth()).toBe(400);
    expect(resolveDesktopMediaFrameWidth(0)).toBe(400);
    expect(resolveDesktopMediaFrameWidth(240)).toBe(240);
  });
});

describe("desktopMediaSizesAttr", () => {
  it("matches the frame width", () => {
    expect(desktopMediaSizesAttr(240)).toBe("(max-width: 256px) calc(100vw - 16px), 240px");
  });
});
