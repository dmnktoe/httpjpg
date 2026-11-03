export const DEFAULT_MAX_TILT = 18;
export const DEFAULT_INTENSITY = 0.8;
/** Degrees of device tilt (either axis) that map to the full card tilt. */
export const GYRO_RANGE = 24;
/** Rest angle of the rainbow band in degrees (card variant only). */
export const REST_ANGLE = 115;
/** Per-frame easing toward the target; higher snaps faster. */
export const SMOOTHING = 0.14;

export type HoloVariant = "card" | "disc";

/** Resolved tilt state written to CSS variables on the rotator. */
export interface HoloState {
  /** rotateX in degrees. */
  rx: number;
  /** rotateY in degrees. */
  ry: number;
  /** Light spot x in percent (0–100). */
  mx: number;
  /** Light spot y in percent (0–100). */
  my: number;
  /** Direction of the rainbow band in degrees. */
  angle: number;
  /** 0 at rest, 1 while the visitor (or the gyroscope) drives the tilt. */
  active: number;
}

export interface Point {
  /** Normalised x (0 = left edge, 1 = right edge). */
  px: number;
  /** Normalised y (0 = top edge, 1 = bottom edge). */
  py: number;
}

export const REST_STATE: HoloState = {
  rx: 0,
  ry: 0,
  mx: 50,
  my: 50,
  angle: REST_ANGLE,
  active: 0,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * Map a normalised point on the card to a tilt. Pressing a corner pushes that
 * corner away (CSS: positive rotateY moves the right edge back, positive
 * rotateX moves the top edge back) and the light spot sits under the pointer.
 */
export function stateFromPoint({ px, py }: Point, maxTilt: number, active = 1): HoloState {
  const x = clamp(px, 0, 1);
  const y = clamp(py, 0, 1);
  const dx = x - 0.5;
  const dy = y - 0.5;
  // Band sweeps across the card as the pointer moves; the spot angle is read
  // from the centre so a diagonal drag turns the band diagonally.
  const angle = dx === 0 && dy === 0 ? REST_ANGLE : (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return {
    rx: -dy * 2 * maxTilt,
    ry: dx * 2 * maxTilt,
    mx: x * 100,
    my: y * 100,
    angle,
    active,
  };
}

/** Normalised point from an element-relative client position. */
export function pointFromRect(clientX: number, clientY: number, rect: DOMRect): Point {
  if (rect.width <= 0 || rect.height <= 0) {
    return { px: 0.5, py: 0.5 };
  }
  return {
    px: clamp((clientX - rect.left) / rect.width, 0, 1),
    py: clamp((clientY - rect.top) / rect.height, 0, 1),
  };
}

export interface Orientation {
  /** Front-to-back tilt in degrees (DeviceOrientationEvent.beta). */
  beta: number;
  /** Left-to-right tilt in degrees (DeviceOrientationEvent.gamma). */
  gamma: number;
}

/**
 * Normalised point from a device orientation, relative to the first reading
 * (the angle the visitor happens to hold the phone at is the rest pose).
 * Tilting the phone right moves the light to the right edge.
 */
export function pointFromOrientation(
  current: Orientation,
  baseline: Orientation,
  range = GYRO_RANGE,
): Point {
  const dg = clamp((current.gamma - baseline.gamma) / range, -1, 1);
  const db = clamp((current.beta - baseline.beta) / range, -1, 1);
  return { px: 0.5 + dg / 2, py: 0.5 + db / 2 };
}

/** Slow figure-eight drift used when nothing drives the tilt. `t` in seconds. */
export function idlePoint(t: number): Point {
  return {
    px: 0.5 + Math.sin(t * 0.55) * 0.22,
    py: 0.5 + Math.sin(t * 0.8 + 1.3) * 0.16,
  };
}

/** Advance `current` toward `target`; `angle` wraps so the band never spins the long way round. */
export function stepState(current: HoloState, target: HoloState, t = SMOOTHING): HoloState {
  const angleDelta = ((((target.angle - current.angle) % 360) + 540) % 360) - 180;
  return {
    rx: lerp(current.rx, target.rx, t),
    ry: lerp(current.ry, target.ry, t),
    mx: lerp(current.mx, target.mx, t),
    my: lerp(current.my, target.my, t),
    angle: current.angle + angleDelta * t,
    active: lerp(current.active, target.active, t),
  };
}

/** True once every channel is within `epsilon` of the target. */
export function isSettled(current: HoloState, target: HoloState, epsilon = 0.05): boolean {
  return (
    Math.abs(current.rx - target.rx) < epsilon &&
    Math.abs(current.ry - target.ry) < epsilon &&
    Math.abs(current.mx - target.mx) < epsilon &&
    Math.abs(current.my - target.my) < epsilon &&
    Math.abs(current.active - target.active) < epsilon
  );
}

export function holoVars(state: HoloState, intensity: number): Record<`--holo-${string}`, string> {
  return {
    "--holo-rx": state.rx.toFixed(2),
    "--holo-ry": state.ry.toFixed(2),
    "--holo-mx": state.mx.toFixed(2),
    "--holo-my": state.my.toFixed(2),
    "--holo-angle": state.angle.toFixed(2),
    "--holo-active": state.active.toFixed(3),
    "--holo-intensity": clamp(intensity, 0, 1).toFixed(2),
  };
}
