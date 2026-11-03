import { aspectOf, DEVICE_FRAMES, isDeviceFrameName } from "./devices";
import {
  clipPathForQuad,
  type DeviceQuad,
  homography,
  matrix3dForQuad,
  project,
  rectQuad,
  scaleQuad,
  screenSize,
} from "./lib";

const SCREEN: DeviceQuad = [
  [100, 20],
  [500, 80],
  [460, 300],
  [60, 240],
];

describe("device-frame lib", () => {
  it("maps every source corner exactly onto its target corner", () => {
    const h = homography(rectQuad(400, 200), SCREEN);
    const corners = rectQuad(400, 200);
    for (let i = 0; i < 4; i++) {
      const [x, y] = project(h, corners[i]);
      expect(x).toBeCloseTo(SCREEN[i][0], 6);
      expect(y).toBeCloseTo(SCREEN[i][1], 6);
    }
    // the centre lands strictly inside the quad
    const [cx, cy] = project(h, [200, 100]);
    expect(cx).toBeGreaterThan(100);
    expect(cx).toBeLessThan(460);
    expect(cy).toBeGreaterThan(80);
    expect(cy).toBeLessThan(240);
  });

  it("emits a normalised matrix3d with the projective terms in the w column", () => {
    const m = matrix3dForQuad(400, 200, SCREEN);
    expect(m.startsWith("matrix3d(")).toBe(true);
    const values = m.slice(9, -1).split(", ").map(Number);
    expect(values).toHaveLength(16);
    expect(values[15]).toBe(1);
    expect(values[10]).toBe(1);
    expect(values[12]).toBeCloseTo(100, 4);
    expect(values[13]).toBeCloseTo(20, 4);
  });

  it("is the identity for an axis-aligned target of the same size", () => {
    const m = matrix3dForQuad(300, 150, rectQuad(300, 150));
    expect(m).toBe("matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)");
  });

  it("builds a percentage clip-path and scales quads", () => {
    expect(clipPathForQuad(SCREEN, 1000, 400)).toBe(
      "polygon(10.000% 5.000%, 50.000% 20.000%, 46.000% 75.000%, 6.000% 60.000%)",
    );
    expect(scaleQuad(SCREEN, 0.5)[1]).toEqual([250, 40]);
  });

  it("sizes the flat screen from the top edge and the screen aspect", () => {
    const { width, height } = screenSize(SCREEN, 2);
    expect(width).toBeCloseTo(Math.hypot(400, 60));
    expect(height).toBeCloseTo(width / 2);
  });
});

describe("device presets", () => {
  it("knows the PSP and rejects anything else", () => {
    expect(isDeviceFrameName("psp")).toBe(true);
    expect(isDeviceFrameName("none")).toBe(false);
    expect(isDeviceFrameName("__proto__")).toBe(false);
    expect(isDeviceFrameName(undefined)).toBe(false);
  });

  it("keeps the PSP screen inside the image", () => {
    const { width, height, screen, screenAspect } = DEVICE_FRAMES.psp;
    for (const [x, y] of screen) {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(height);
    }
    expect(aspectOf(screenAspect)).toBeCloseTo(480 / 272);
    expect(aspectOf("broken")).toBeCloseTo(16 / 9);
  });
});
