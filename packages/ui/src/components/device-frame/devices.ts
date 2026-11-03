import type { DeviceQuad } from "./lib";

export interface DeviceFramePreset {
  /** Human-readable name, used as the image's alt text. */
  name: string;
  /** Cut-out device image with a transparent background. Served from the app's public folder. */
  src: string;
  /** Natural size of `src` in px. Screen coordinates are given in this space. */
  width: number;
  height: number;
  /** Screen corners clockwise from top-left, in `src` px. */
  screen: DeviceQuad;
  /** The screen's own aspect ratio, as a CSS ratio string. */
  screenAspect: string;
}

/**
 * Devices a video can be framed in. Add a new one by dropping a cut-out
 * WebP into `apps/portfolio/public/images/devices/` and reading its screen
 * corners off the image (tools/scratch: threshold the dark panel, take the
 * extreme points). Keep `screen` in the file's own pixel space.
 */
export const DEVICE_FRAMES = {
  psp: {
    name: "Sony PSP",
    src: "/images/devices/psp.webp",
    width: 1800,
    height: 962,
    screen: [
      [505, 54],
      [1471, 255],
      [1275, 741],
      [303, 526],
    ],
    screenAspect: "480/272",
  },
} as const satisfies Record<string, DeviceFramePreset>;

export type DeviceFrameName = keyof typeof DEVICE_FRAMES;

export function isDeviceFrameName(value: unknown): value is DeviceFrameName {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(DEVICE_FRAMES, value);
}

/** Numeric aspect of a `w/h` ratio string. */
export function aspectOf(ratio: string): number {
  const [w, h] = ratio.split("/").map(Number);
  return w && h ? w / h : 16 / 9;
}
