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

float star(vec2 p, float size) {
  p /= size;
  float arms = max(exp(-abs(p.x) * 6.0) * exp(-abs(p.y) * 40.0), exp(-abs(p.y) * 6.0) * exp(-abs(p.x) * 40.0));
  float core = exp(-dot(p, p) * 12.0);
  return clamp(arms + core, 0.0, 1.0);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 px = uv * uSize;
  float minSide = min(uSize.x, uSize.y);
  vec2 aspectScale = uSize / minSide;
  vec2 light = uLight;
  float tiltPhase = uTilt.y * 0.9 - uTilt.x * 0.6;
  // Foil shows more the further the card is tilted, like the real thing.
  float drive = uActive * (0.45 + 0.55 * uDist);
  float lightAngle = atan(light.y - 0.5, light.x - 0.5);
  vec2 dir = vec2(cos(lightAngle + 1.5708), sin(lightAngle + 1.5708));

  vec3 col = vec3(0.0);
  float alpha = 1.0;
  float holoW = 1.0;
  float isFrame = 0.0;
  vec2 texUv = uv;

  if (uVariant < 0.5) {
    float d = roundedRect(px - uSize * 0.5, uSize * 0.5, uRadius);
    alpha = 1.0 - smoothstep(-1.0, 1.0, d);
    float fw = uFrame * minSide;
    vec2 inner = uSize - 2.0 * fw;
    float di = roundedRect(px - uSize * 0.5, inner * 0.5, max(uRadius - fw, 2.0));
    isFrame = smoothstep(-0.75, 0.75, di);
    texUv = coverUv((px - fw) / inner, inner.x / inner.y);
    vec3 photo = texture2D(uTex, texUv).rgb;
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
    texUv = coverUv(uv, 1.0);
    vec3 photo = texture2D(uTex, texUv).rgb;
    float hub = smoothstep(0.38, 0.37, r) * smoothstep(0.15, 0.16, r);
    col = mix(photo, mix(photo, vec3(0.92), 0.3), hub);
    float rim = smoothstep(0.006, 0.0, abs(r - 0.38)) + smoothstep(0.006, 0.0, abs(r - 0.17));
    col += rim * 0.25;
    col *= 1.0 - 0.06 * (0.5 + 0.5 * sin(r * minSide * 1.6));
    col *= 0.8;
    holoW = 0.65 + 0.35 * smoothstep(0.2, 0.9, luma(photo));
  }

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

  vec2 t = 1.5 / uTexSize;
  float tl = luma(texture2D(uTex, texUv + vec2(-t.x, -t.y)).rgb);
  float tr = luma(texture2D(uTex, texUv + vec2( t.x, -t.y)).rgb);
  float bl = luma(texture2D(uTex, texUv + vec2(-t.x,  t.y)).rgb);
  float br = luma(texture2D(uTex, texUv + vec2( t.x,  t.y)).rgb);
  float l0 = luma(texture2D(uTex, texUv + vec2(-t.x, 0.0)).rgb);
  float r0 = luma(texture2D(uTex, texUv + vec2( t.x, 0.0)).rgb);
  float t0 = luma(texture2D(uTex, texUv + vec2(0.0, -t.y)).rgb);
  float b0 = luma(texture2D(uTex, texUv + vec2(0.0,  t.y)).rgb);
  float gx = (tr + 2.0 * r0 + br) - (tl + 2.0 * l0 + bl);
  float gy = (bl + 2.0 * b0 + br) - (tl + 2.0 * t0 + tr);
  float edge = smoothstep(0.12, 0.6, length(vec2(gx, gy)));
  vec3 fringe = hsl2rgb(fract(phase * 2.0 + atan(gy, gx) * 0.159), 1.0, 0.62);
  col += fringe * edge * (1.0 - isFrame) * uIntensity * (0.35 + 0.65 * drive) * mix(0.9, 0.5, uVariant);

  vec3 starCol = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    vec2 sp = 0.06 + vec2(hash(vec2(fi, 1.7)), hash(vec2(fi, 9.1))) * 0.88;
    float sz = 0.035 + 0.045 * hash(vec2(fi, 3.3));
    vec2 p = (uv - sp) * aspectScale;
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
  gl_FragColor = vec4(col * alpha, alpha);
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
}

export interface HoloRenderer {
  /** Upload a decoded image as the surface texture and paint the rest pose. */
  setImage(image: TexImageSource & { naturalWidth?: number; naturalHeight?: number }): void;
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
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      const texWidth = image.naturalWidth || (image as { width?: number }).width || 1;
      const texHeight = image.naturalHeight || (image as { height?: number }).height || 1;
      gl.uniform2f(uniforms.uTexSize, texWidth, texHeight);
      hasTexture = true;
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
