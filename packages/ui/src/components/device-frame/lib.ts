/** A point in the device image's own pixel space. */
export type DevicePoint = readonly [x: number, y: number];

/** Screen corners in the device image's pixel space, clockwise from top-left. */
export type DeviceQuad = readonly [DevicePoint, DevicePoint, DevicePoint, DevicePoint];

/** 3×3 row-major matrix. */
type Mat3 = [number, number, number, number, number, number, number, number, number];

function adjugate(m: Mat3): Mat3 {
  return [
    m[4] * m[8] - m[5] * m[7],
    m[2] * m[7] - m[1] * m[8],
    m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8],
    m[0] * m[8] - m[2] * m[6],
    m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6],
    m[1] * m[6] - m[0] * m[7],
    m[0] * m[4] - m[1] * m[3],
  ];
}

function multiply(a: Mat3, b: Mat3): Mat3 {
  const out = new Array<number>(9) as Mat3;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      out[row * 3 + col] =
        a[row * 3] * b[col] + a[row * 3 + 1] * b[3 + col] + a[row * 3 + 2] * b[6 + col];
    }
  }
  return out;
}

function multiplyVector(m: Mat3, v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/** Matrix that sends the projective basis to the four given points. */
function basisToPoints(quad: DeviceQuad): Mat3 {
  const [p1, p2, p3, p4] = quad;
  const m: Mat3 = [p1[0], p2[0], p3[0], p1[1], p2[1], p3[1], 1, 1, 1];
  const v = multiplyVector(adjugate(m), [p4[0], p4[1], 1]);
  return multiply(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

/**
 * Homography mapping the `source` quad onto the `target` quad (both clockwise
 * from top-left). Standard four-point projective transform.
 */
export function homography(source: DeviceQuad, target: DeviceQuad): Mat3 {
  return multiply(basisToPoints(target), adjugate(basisToPoints(source)));
}

/** Apply a homography to a point. */
export function project(m: Mat3, [x, y]: DevicePoint): DevicePoint {
  const [px, py, pw] = multiplyVector(m, [x, y, 1]);
  return [px / pw, py / pw];
}

/** Axis-aligned rectangle corners for a `width × height` box at the origin. */
export function rectQuad(width: number, height: number): DeviceQuad {
  return [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
}

/**
 * CSS `matrix3d()` that maps an element of `width × height` CSS px (with
 * `transform-origin: 0 0`) onto `target`, given in the same CSS px space.
 */
export function matrix3dForQuad(width: number, height: number, target: DeviceQuad): string {
  const h = homography(rectQuad(width, height), target);
  const t = h.map((value) => value / h[8]);
  // Column-major 4×4 with the projective row folded into the w column.
  const m = [t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]];
  return `matrix3d(${m.map((value) => Number(value.toFixed(6))).join(", ")})`;
}

/** `clip-path: polygon()` for a quad, as percentages of the device image. */
export function clipPathForQuad(quad: DeviceQuad, width: number, height: number): string {
  const points = quad.map(
    ([x, y]) => `${((x / width) * 100).toFixed(3)}% ${((y / height) * 100).toFixed(3)}%`,
  );
  return `polygon(${points.join(", ")})`;
}

/**
 * Size of the flat screen rectangle the media is laid out in before it is
 * projected: as wide as the quad's top edge, with the screen's own aspect.
 */
export function screenSize(quad: DeviceQuad, aspect: number): { width: number; height: number } {
  const [tl, tr] = quad;
  const width = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);
  return { width, height: width / aspect };
}

/** Scale a quad uniformly (device px → layout px). */
export function scaleQuad(quad: DeviceQuad, scale: number): DeviceQuad {
  return quad.map(([x, y]) => [x * scale, y * scale] as DevicePoint) as unknown as DeviceQuad;
}
