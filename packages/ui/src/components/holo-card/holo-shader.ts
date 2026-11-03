import { type HoloState, type HoloVariant, REST_STATE } from "./lib";

/**
 * Fragment shader for the holo surface. The CSS rotator supplies the 3D tilt;
 * this only paints the foil per pixel: pastel rainbow bands that slide with
 * the tilt, a hexagonal glitter grid whose dots light up at their own angle,
 * a rainbow fringe along the photo's edges, scattered four-point stars and a
 * specular glare under the light. `uVariant` 1 paints a CD instead of a card.
 */
export const HOLO_VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Layering and tuning follow simeydotme/pokemon-cards-css (GPL-3.0; studied, not
// copied): foil strength scales with how far the light sits from the centre,
// pastel "sunpillar" hues, glare as an overlay radial, a soft delayed snap back.
export const HOLO_FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexSize;
uniform vec2 uSize;
uniform vec4 uCard;
uniform vec2 uTilt;
uniform vec2 uLight;
uniform float uActive;
uniform float uDist;
uniform float uIntensity;
uniform float uTime;
uniform float uVariant;
uniform float uFrame;
uniform float uRadius;
uniform float uSeed;
uniform sampler2D uFg;
uniform float uHasFg;
uniform float uDepth;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 hsl2rgb(float h, float s, float l) {
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

vec2 coverUv(vec2 uv, float rectAspect) {
  float texAspect = uTexSize.x / uTexSize.y;
  vec2 scale = vec2(1.0);
  if (texAspect > rectAspect) scale.x = rectAspect / texAspect; else scale.y = texAspect / rectAspect;
  return (uv - 0.5) * scale + 0.5;
}

float roundedRect(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec2 hexCenter(vec2 p, out vec2 id) {
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r * 0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  vec2 ca = (dot(a, a) < dot(b, b)) ? a : b;
  id = p - ca;
  return ca;
}

// Big four-point flare that can sit outside the card.
float flare(vec2 p, float size) {
  p /= size;
  float arms = max(exp(-abs(p.x) * 3.5) * exp(-abs(p.y) * 30.0), exp(-abs(p.y) * 3.5) * exp(-abs(p.x) * 30.0));
  float core = exp(-dot(p, p) * 6.0);
  return clamp(arms * 0.9 + core, 0.0, 1.0);
}

float star(vec2 p, float size) {
  p /= size;
  float arms = max(exp(-abs(p.x) * 6.0) * exp(-abs(p.y) * 40.0), exp(-abs(p.y) * 6.0) * exp(-abs(p.x) * 40.0));
  float core = exp(-dot(p, p) * 12.0);
  return clamp(arms + core, 0.0, 1.0);
}

void main() {
  // The canvas overhangs the card (uCard = x, y, w, h of the card inside it)
  // so flares and arcs can spill past the edge.
  vec2 fullPx = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 size = uCard.zw;
  vec2 px = fullPx - uCard.xy;
  vec2 uv = px / size;
  float minSide = min(size.x, size.y);
  vec2 aspectScale = size / minSide;
  vec2 light = uLight;
  float tiltPhase = uTilt.y * 0.9 - uTilt.x * 0.6;
  // Foil shows more the further the card is tilted, like the real thing.
  float drive = uActive * (0.45 + 0.55 * uDist);
  // Parallax: layers behind the surface slide against the tilt, layers in
  // front slide with it. The photo is zoomed a touch so no edge shows.
  vec2 shift = vec2(uTilt.y, -uTilt.x) * uDepth;
  float zoom = 1.0 / (1.0 + 0.06 * uDepth);
  float lightAngle = atan(light.y - 0.5, light.x - 0.5);
  vec2 dir = vec2(cos(lightAngle + 1.5708), sin(lightAngle + 1.5708));

  vec3 col = vec3(0.0);
  float alpha = 1.0;
  float holoW = 1.0;
  float isFrame = 0.0;
  vec2 texUv = uv;
  vec2 photoUv = uv;

  if (uVariant < 0.5) {
    float d = roundedRect(px - size * 0.5, size * 0.5, uRadius);
    alpha = 1.0 - smoothstep(-1.0, 1.0, d);
    float fw = uFrame * minSide;
    vec2 inner = size - 2.0 * fw;
    float di = roundedRect(px - size * 0.5, inner * 0.5, max(uRadius - fw, 2.0));
    isFrame = smoothstep(-0.75, 0.75, di);
    texUv = (coverUv((px - fw) / inner, inner.x / inner.y) - 0.5) * zoom + 0.5;
    photoUv = texUv - shift * 0.025;
    vec3 photo = texture2D(uTex, photoUv).rgb;
    vec3 silver = mix(vec3(0.80, 0.81, 0.86), vec3(0.95, 0.95, 0.97), 0.5 + 0.5 * sin((uv.x + uv.y) * 6.0 + tiltPhase * 3.0));
    // brushed metal: fine diagonal lines that catch the light
    float brush = sin(dot(px, vec2(0.68, -0.73)) * 1.9 + tiltPhase * 20.0);
    silver += brush * 0.045;
    col = mix(photo, silver, isFrame);
    holoW = mix(smoothstep(0.15, 0.95, luma(photo)) * 0.85 + 0.15, 1.0, isFrame);
  } else {
    vec2 c = (uv - 0.5) * 2.0;
    float r = length(c);
    float aa = 2.0 / minSide;
    alpha = (1.0 - smoothstep(1.0 - aa, 1.0, r)) * smoothstep(0.15, 0.15 + aa, r);
    texUv = (coverUv(uv, 1.0) - 0.5) * zoom + 0.5;
    photoUv = texUv - shift * 0.025;
    vec3 photo = texture2D(uTex, photoUv).rgb;
    float hub = smoothstep(0.38, 0.37, r) * smoothstep(0.15, 0.16, r);
    col = mix(photo, mix(photo, vec3(0.92), 0.3), hub);
    float rim = smoothstep(0.006, 0.0, abs(r - 0.38)) + smoothstep(0.006, 0.0, abs(r - 0.17));
    col += rim * 0.25;
    col *= 1.0 - 0.06 * (0.5 + 0.5 * sin(r * minSide * 1.6));
    col *= 0.8;
    holoW = 0.65 + 0.35 * smoothstep(0.2, 0.9, luma(photo));
  }

  // Optional cut-out in front of the photo: own parallax, soft shadow on the
  // photo, and later a rainbow fringe around its silhouette.
  vec2 fgUv = texUv + shift * 0.05;
  vec4 fg = texture2D(uFg, fgUv);
  float inside = step(0.0, fgUv.x) * step(fgUv.x, 1.0) * step(0.0, fgUv.y) * step(fgUv.y, 1.0);
  float fgA = fg.a * inside * uHasFg * (1.0 - isFrame);
  float shadowA = texture2D(uFg, fgUv + vec2(-0.012, -0.018) * uDepth).a * uHasFg * (1.0 - isFrame);
  col *= 1.0 - shadowA * (1.0 - fgA) * (0.22 + 0.3 * drive);
  col = mix(col, fg.rgb, fgA);

  float phase;
  float fanW = 1.0;
  if (uVariant < 0.5) {
    phase = dot(uv, dir) * 2.6 + tiltPhase;
  } else {
    vec2 c = uv - 0.5;
    float facing = cos(atan(c.y, c.x) - lightAngle);
    phase = facing * 2.0 + tiltPhase + length(c) * 0.6;
    fanW = smoothstep(0.2, 0.9, abs(facing)) * 1.1;
  }
  vec3 rainbow = hsl2rgb(fract(phase), 0.95, mix(0.72, 0.6, uVariant));
  float sheen = pow(0.5 + 0.5 * sin(phase * 3.1416), 1.5);
  float rainbowAmt = uIntensity * holoW * fanW * (0.22 + 0.42 * drive) * sheen;
  vec3 chroma = rainbow - vec3(luma(rainbow));
  vec3 screened = col + chroma * rainbowAmt * 1.7 + rainbow * rainbowAmt * 0.2 * holoW;
  vec3 framed = col * mix(vec3(1.0), rainbow * 1.15, 0.55 + 0.35 * drive);
  col = mix(screened, framed, isFrame);

  float cell = minSide / 44.0;
  vec2 hid;
  vec2 hp = hexCenter(px / cell, hid);
  float dotShape = 1.0 - smoothstep(0.22, 0.34, length(hp));
  float h1 = hash(hid);
  float pop = pow(smoothstep(0.6, 1.0, fract(h1 + tiltPhase * 1.3 + uTime * 0.02)), 1.5);
  float lightFall = 1.0 - smoothstep(0.0, 1.1, distance(uv * aspectScale, light * aspectScale));
  float glitter = dotShape * pop * (0.35 + 0.65 * lightFall) * (0.45 + 0.55 * drive);
  vec3 dotCol = mix(vec3(1.0), hsl2rgb(fract(h1 + phase), 1.0, 0.7), 0.6);
  col += dotCol * glitter * uIntensity * holoW * mix(0.9, 0.5, uVariant);

  // sparse glitter specks between the dots, each winking at its own angle
  vec2 sid = floor(px / 2.0);
  float sh = hash(sid + 7.0);
  float speck = step(0.965, sh) * step(0.72, fract(sh * 13.0 + tiltPhase * 2.2 + uTime * 0.05));
  col += vec3(1.0) * speck * (0.15 + 0.6 * drive) * uIntensity * (0.4 + 0.6 * lightFall);

  // Wider taps and a higher threshold keep the fringe on real contours instead
  // of outlining every bit of texture; a cut-out takes over most of the role.
  vec2 t = 2.5 / uTexSize;
  float tl = luma(texture2D(uTex, photoUv + vec2(-t.x, -t.y)).rgb);
  float tr = luma(texture2D(uTex, photoUv + vec2( t.x, -t.y)).rgb);
  float bl = luma(texture2D(uTex, photoUv + vec2(-t.x,  t.y)).rgb);
  float br = luma(texture2D(uTex, photoUv + vec2( t.x,  t.y)).rgb);
  float l0 = luma(texture2D(uTex, photoUv + vec2(-t.x, 0.0)).rgb);
  float r0 = luma(texture2D(uTex, photoUv + vec2( t.x, 0.0)).rgb);
  float t0 = luma(texture2D(uTex, photoUv + vec2(0.0, -t.y)).rgb);
  float b0 = luma(texture2D(uTex, photoUv + vec2(0.0,  t.y)).rgb);
  float gx = (tr + 2.0 * r0 + br) - (tl + 2.0 * l0 + bl);
  float gy = (bl + 2.0 * b0 + br) - (tl + 2.0 * t0 + tr);
  float edge = smoothstep(0.3, 0.9, length(vec2(gx, gy)));
  vec3 fringe = hsl2rgb(fract(phase * 2.0 + atan(gy, gx) * 0.159), 1.0, 0.62);
  col += fringe * edge * (1.0 - isFrame) * uIntensity * (0.25 + 0.5 * drive) * mix(0.9, 0.5, uVariant) * mix(1.0, 0.35, uHasFg);
  if (uHasFg > 0.5) {
    vec2 tf = 2.0 / uTexSize;
    float al = texture2D(uFg, fgUv + vec2(-tf.x, 0.0)).a;
    float ar = texture2D(uFg, fgUv + vec2( tf.x, 0.0)).a;
    float at = texture2D(uFg, fgUv + vec2(0.0, -tf.y)).a;
    float ab = texture2D(uFg, fgUv + vec2(0.0,  tf.y)).a;
    float fgEdge = smoothstep(0.08, 0.6, abs(ar - al) + abs(ab - at)) * inside * (1.0 - isFrame);
    vec3 fgFringe = hsl2rgb(fract(phase * 2.0 + atan(ab - at, ar - al) * 0.159), 1.0, 0.68);
    col += fgFringe * fgEdge * uIntensity * (0.3 + 0.45 * drive);
  }

  vec3 starCol = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    vec2 sp = 0.06 + vec2(hash(vec2(fi, 1.7)), hash(vec2(fi, 9.1))) * 0.88;
    float sz = 0.035 + 0.045 * hash(vec2(fi, 3.3));
    vec2 p = (uv - sp + shift * 0.035) * aspectScale;
    float tw = 0.45 + 0.55 * (0.5 + 0.5 * sin(uTime * 1.8 + fi * 2.1 + tiltPhase * 4.0));
    float near = 1.0 - smoothstep(0.0, 0.9, distance(sp, light));
    float s = star(p, sz) * tw * (0.25 + 0.75 * near);
    starCol += s * mix(vec3(1.0), hsl2rgb(fract(fi * 0.17 + phase), 1.0, 0.7), 0.5);
  }
  col += starCol * uIntensity * (0.6 + 0.4 * drive) * (1.0 - isFrame * 0.7);

  float g = pow(1.0 - smoothstep(0.0, 0.85, distance(uv * aspectScale, light * aspectScale)), 2.2);
  col += vec3(1.0) * g * uIntensity * (0.08 + 0.36 * uActive) * mix(1.0, 0.6, uVariant);
  col *= 1.0 - 0.08 * uActive * (1.0 - g);

  col = clamp(col, 0.0, 1.0);
  vec4 outColor = vec4(col * alpha, alpha);

  // ---- particles in front of the card, free to leave its bounds ----
  float burst = 0.15 + 0.85 * uActive;
  vec3 particles = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float fi = float(i) + 40.0;
    float period = 2.4 + 1.8 * hash(vec2(fi, 4.2));
    float cyc = uTime / period + hash(vec2(fi, 8.8));
    float k = floor(cyc);
    float f = fract(cyc);
    float env = smoothstep(0.0, 0.08, f) * (1.0 - smoothstep(0.35, 0.9, f));
    vec2 pos = vec2(hash(vec2(fi, k + 0.1)), hash(vec2(fi, k + 0.7))) * 1.3 - 0.15;
    float sz = 0.07 + 0.11 * hash(vec2(fi, k + 0.3));
    vec2 p = (uv - pos + shift * 0.06) * aspectScale;
    float sp = flare(p, sz * (0.55 + 0.45 * env)) * env;
    vec3 tint = mix(vec3(1.0), hsl2rgb(fract(hash(vec2(fi, k + 0.5)) + phase * 0.5), 1.0, 0.78), 0.4);
    particles += sp * tint;
  }
  for (int i = 0; i < 3; i++) {
    float fi = float(i) + 60.0;
    float period = 3.2 + 1.8 * hash(vec2(fi, 1.1));
    float cyc = uTime / period + hash(vec2(fi, 2.2));
    float k = floor(cyc);
    float f = fract(cyc);
    float env = smoothstep(0.0, 0.1, f) * (1.0 - smoothstep(0.6, 1.0, f));
    vec2 c = vec2(0.3 + 0.4 * hash(vec2(fi, k + 0.1)), 0.3 + 0.4 * hash(vec2(fi, k + 0.2)));
    float radius = 0.5 + 0.4 * hash(vec2(fi, k + 0.3));
    float dir = hash(vec2(fi, k + 0.6)) > 0.5 ? 1.0 : -1.0;
    vec2 q = (uv - c + shift * 0.04) * aspectScale;
    float r = length(q);
    float ang = atan(q.y, q.x);
    float head = hash(vec2(fi, k + 0.4)) * 6.2832 + (f * 1.7 - 0.2) * 6.2832 * dir;
    float behind = mod((head - ang) * dir, 6.2832);
    float tail = 1.0 - smoothstep(0.0, 1.4, behind);
    float lineW = 1.6 / size.x;
    float line = exp(-pow((r - radius) / lineW, 2.0));
    particles += vec3(1.0, 0.98, 1.0) * line * tail * env * 0.9;
  }
  particles *= uIntensity * burst;
  float particleA = clamp(max(particles.r, max(particles.g, particles.b)), 0.0, 1.0);
  outColor.rgb = clamp(outColor.rgb + particles, 0.0, 1.0);
  outColor.a = max(outColor.a, particleA);

  gl_FragColor = outColor;
}`;

export interface HoloRendererOptions {
  variant: HoloVariant;
  /** Foil strength (0–1). */
  intensity: number;
  /** Frame width as a fraction of the shorter side (card only). */
  frame: number;
  /** Corner radius in CSS px (card only). */
  radius: number;
  /** Per-card seed so star and glitter layouts differ. */
  seed: number;
  /** Max tilt in degrees; normalises `HoloState.rx/ry` for the shader. */
  maxTilt: number;
  /** Parallax strength: 0 flat, 1 default, 2 deep. */
  depth: number;
  /** Canvas overhang on each side as a fraction of the card, for particles that leave it. */
  overscan: number;
}

export interface HoloRenderer {
  /** Upload a decoded image as the surface texture and paint the rest pose. */
  setImage(image: TexImageSource & { naturalWidth?: number; naturalHeight?: number }): void;
  /** Upload a cut-out (alpha) that floats in front of the photo; `null` removes it. */
  setForeground(image: TexImageSource | null): void;
  /** Resize the drawing buffer to CSS px × dpr and repaint. */
  resize(width: number, height: number, dpr: number): void;
  /** Paint one frame. `time` in seconds drives the twinkle. */
  render(state: HoloState, time: number): void;
  dispose(): void;
}

const UNIFORMS = [
  "uTex",
  "uTexSize",
  "uSize",
  "uCard",
  "uTilt",
  "uLight",
  "uActive",
  "uDist",
  "uIntensity",
  "uTime",
  "uVariant",
  "uFrame",
  "uRadius",
  "uSeed",
  "uFg",
  "uHasFg",
  "uDepth",
] as const;

type UniformName = (typeof UNIFORMS)[number];

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("HoloCard: could not create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "";
    gl.deleteShader(shader);
    throw new Error(`HoloCard: shader failed to compile: ${log}`);
  }
  return shader;
}

/**
 * Paints the holo foil onto `canvas`. Returns `null` when WebGL is not
 * available so callers can fall back to the plain image.
 */
export function createHoloRenderer(
  canvas: HTMLCanvasElement,
  options: HoloRendererOptions,
): HoloRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    preserveDrawingBuffer: false,
  }) as WebGLRenderingContext | null;
  if (!gl) {
    return null;
  }

  let program: WebGLProgram | null = null;
  const vertex = compileShader(gl, gl.VERTEX_SHADER, HOLO_VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, HOLO_FRAGMENT_SHADER);
  program = gl.createProgram();
  if (!program) {
    throw new Error("HoloCard: could not create program");
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "";
    gl.deleteProgram(program);
    throw new Error(`HoloCard: program failed to link: ${log}`);
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {} as Record<UniformName, WebGLUniformLocation | null>;
  for (const name of UNIFORMS) {
    uniforms[name] = gl.getUniformLocation(program, name);
  }

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(uniforms.uTex, 0);

  const fgTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, fgTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(uniforms.uFg, 1);
  gl.uniform1f(uniforms.uHasFg, 0);
  gl.uniform1f(uniforms.uDepth, options.depth);
  gl.uniform1f(uniforms.uVariant, options.variant === "disc" ? 1 : 0);
  gl.uniform1f(uniforms.uIntensity, options.intensity);
  gl.uniform1f(uniforms.uFrame, options.variant === "disc" ? 0 : options.frame);
  gl.uniform1f(uniforms.uSeed, options.seed);
  gl.clearColor(0, 0, 0, 0);

  let hasTexture = false;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastState: HoloState = REST_STATE;
  let lastTime = 0;
  const tiltScale = options.maxTilt > 0 ? 1 / options.maxTilt : 0;

  const draw = () => {
    if (!hasTexture || width === 0 || height === 0 || gl.isContextLost()) {
      return;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.uSize, width, height);
    const cardWidth = width / (1 + 2 * options.overscan);
    const cardHeight = height / (1 + 2 * options.overscan);
    gl.uniform4f(
      uniforms.uCard,
      options.overscan * cardWidth,
      options.overscan * cardHeight,
      cardWidth,
      cardHeight,
    );
    gl.uniform1f(uniforms.uRadius, options.radius * 1);
    gl.uniform2f(uniforms.uTilt, lastState.rx * tiltScale, lastState.ry * tiltScale);
    gl.uniform2f(uniforms.uLight, lastState.mx / 100, lastState.my / 100);
    gl.uniform1f(uniforms.uActive, lastState.active);
    gl.uniform1f(uniforms.uDist, lastState.dist);
    gl.uniform1f(uniforms.uTime, lastTime);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // Unused but keeps the pixel ratio in the closure for debugging resizes.
    void dpr;
  };

  return {
    setImage(image) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      const texWidth = image.naturalWidth || (image as { width?: number }).width || 1;
      const texHeight = image.naturalHeight || (image as { height?: number }).height || 1;
      gl.uniform2f(uniforms.uTexSize, texWidth, texHeight);
      hasTexture = true;
      draw();
    },
    setForeground(image) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, fgTexture);
      if (image) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      }
      gl.uniform1f(uniforms.uHasFg, image ? 1 : 0);
      draw();
    },
    resize(nextWidth, nextHeight, nextDpr) {
      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.max(1, Math.round(nextWidth * nextDpr));
      canvas.height = Math.max(1, Math.round(nextHeight * nextDpr));
      draw();
    },
    render(state, time) {
      lastState = state;
      lastTime = time;
      draw();
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteTexture(fgTexture);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (program) {
        gl.deleteProgram(program);
        program = null;
      }
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    },
  };
}

/** Deterministic 0–1 seed from a string (e.g. the image URL). */
export function seedFromString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}
