import {
  clamp,
  holoVars,
  idlePoint,
  isSettled,
  lerp,
  pointFromOrientation,
  pointFromRect,
  REST_ANGLE,
  REST_STATE,
  stateFromPoint,
  stepState,
} from "./lib";

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

describe("holo-card lib", () => {
  it("clamps and lerps", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(lerp(0, 10, 0.25)).toBe(2.5);
  });

  it("pushes the pressed corner away and parks the light under the pointer", () => {
    const topLeft = stateFromPoint({ px: 0, py: 0 }, 18);
    expect(topLeft.rx).toBe(18);
    expect(topLeft.ry).toBe(-18);
    expect(topLeft.mx).toBe(0);
    expect(topLeft.my).toBe(0);
    expect(topLeft.active).toBe(1);

    const bottomRight = stateFromPoint({ px: 1, py: 1 }, 18);
    expect(bottomRight.rx).toBe(-18);
    expect(bottomRight.ry).toBe(18);
    expect(bottomRight.mx).toBe(100);
  });

  it("keeps the rest angle at the centre and clamps out-of-range points", () => {
    expect(stateFromPoint({ px: 0.5, py: 0.5 }, 18).angle).toBe(REST_ANGLE);
    const clamped = stateFromPoint({ px: 4, py: -2 }, 10, 0);
    expect(clamped.mx).toBe(100);
    expect(clamped.my).toBe(0);
    expect(clamped.active).toBe(0);
  });

  it("maps client coordinates into the element", () => {
    expect(pointFromRect(150, 50, rect(100, 0, 200, 100))).toEqual({ px: 0.25, py: 0.5 });
    expect(pointFromRect(0, 0, rect(0, 0, 0, 0))).toEqual({ px: 0.5, py: 0.5 });
    expect(pointFromRect(999, 999, rect(0, 0, 10, 10))).toEqual({ px: 1, py: 1 });
  });

  it("reads orientation relative to the baseline and clamps to the range", () => {
    const baseline = { beta: 40, gamma: 5 };
    expect(pointFromOrientation(baseline, baseline)).toEqual({ px: 0.5, py: 0.5 });
    const tilted = pointFromOrientation({ beta: 52, gamma: -7 }, baseline, 24);
    expect(tilted.px).toBeCloseTo(0.25);
    expect(tilted.py).toBeCloseTo(0.75);
    expect(pointFromOrientation({ beta: 400, gamma: -400 }, baseline, 24)).toEqual({
      px: 0,
      py: 1,
    });
  });

  it("drifts inside the card while idle", () => {
    for (const t of [0, 1.3, 7.7, 42]) {
      const { px, py } = idlePoint(t);
      expect(px).toBeGreaterThan(0.2);
      expect(px).toBeLessThan(0.8);
      expect(py).toBeGreaterThan(0.25);
      expect(py).toBeLessThan(0.75);
    }
  });

  it("eases toward the target and takes the short way round for angles", () => {
    const target = { ...REST_STATE, rx: 10, angle: 350 };
    const current = { ...REST_STATE, angle: 10 };
    const next = stepState(current, target, 0.5);
    expect(next.rx).toBe(5);
    expect(next.angle).toBe(0);
    expect(isSettled(current, target)).toBe(false);
    expect(isSettled(target, target)).toBe(true);
  });

  it("formats CSS variables with a clamped intensity", () => {
    const vars = holoVars({ ...REST_STATE, rx: 1.2345 }, 3);
    expect(vars["--holo-rx"]).toBe("1.23");
    expect(vars["--holo-intensity"]).toBe("1.00");
    expect(vars["--holo-mx"]).toBe("50.00");
  });
});
