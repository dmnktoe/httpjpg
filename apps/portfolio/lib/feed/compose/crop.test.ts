// @vitest-environment node
import { cropPreviewStyle, cropRect, formatRatio, isCropped, panCrop } from "./crop";

const WIDE = { width: 4000, height: 2000, ratio: 1, zoom: 1, offsetX: 0, offsetY: 0 };
const TALL = { width: 2000, height: 4000, ratio: 1, zoom: 1, offsetX: 0, offsetY: 0 };

describe("cropRect", () => {
  it("centres the largest frame a wide picture holds", () => {
    expect(cropRect(WIDE)).toEqual({ x: 1000, y: 0, width: 2000, height: 2000 });
  });

  it("centres the largest frame a tall picture holds", () => {
    expect(cropRect(TALL)).toEqual({ x: 0, y: 1000, width: 2000, height: 2000 });
  });

  it("follows the offset to either edge", () => {
    expect(cropRect({ ...WIDE, offsetX: -1 }).x).toBe(0);
    expect(cropRect({ ...WIDE, offsetX: 1 }).x).toBe(2000);
    expect(cropRect({ ...WIDE, offsetX: 5 }).x).toBe(2000);
  });

  it("looks closer with zoom, and never further than the frame", () => {
    expect(cropRect({ ...WIDE, zoom: 2 })).toEqual({ x: 1500, y: 500, width: 1000, height: 1000 });
    expect(cropRect({ ...WIDE, zoom: 0.2 }).width).toBe(2000);
    expect(cropRect({ ...WIDE, zoom: 99 }).width).toBeCloseTo(2000 / 3);
    expect(cropRect({ ...WIDE, zoom: Number.NaN }).width).toBe(2000);
  });

  it("keeps the frame's shape", () => {
    const rect = cropRect({ ...TALL, ratio: 4 / 5 });

    expect(rect.width / rect.height).toBeCloseTo(0.8);
  });
});

describe("isCropped", () => {
  it("is false for what fill shows anyway", () => {
    expect(isCropped(WIDE)).toBe(false);
    expect(isCropped({ ...WIDE, zoom: 1.2 })).toBe(true);
    expect(isCropped({ ...WIDE, offsetX: 0.1 })).toBe(true);
    expect(isCropped({ ...WIDE, offsetY: -0.1 })).toBe(true);
  });
});

describe("panCrop", () => {
  it("moves the frame against the drag, within the picture", () => {
    expect(panCrop(WIDE, 0.25, 0)).toEqual({ offsetX: -0.5, offsetY: 0 });
    expect(panCrop(WIDE, -9, 0).offsetX).toBe(1);
    expect(panCrop(TALL, 0, -0.25)).toEqual({ offsetX: 0, offsetY: 0.5 });
  });

  it("has nowhere to go along a side the frame already fills", () => {
    expect(panCrop(WIDE, 0, 0.5).offsetY).toBe(0);
  });
});

describe("cropPreviewStyle", () => {
  it("lays the picture out so the crop fills the frame", () => {
    expect(cropPreviewStyle(WIDE)).toEqual({
      left: "-50%",
      top: "0%",
      width: "200%",
      height: "100%",
    });
  });
});

describe("formatRatio", () => {
  it("knows the fixed shapes and reads the original from the first file", () => {
    expect(formatRatio("1/1")).toBe(1);
    expect(formatRatio("4/5")).toBe(0.8);
    expect(formatRatio("original", { width: 300, height: 200 })).toBe(1.5);
    expect(formatRatio("original")).toBe(1);
  });
});
