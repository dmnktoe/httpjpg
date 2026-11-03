import { createHoloRenderer, seedFromString } from "./holo-shader";
import { REST_STATE } from "./lib";

function fakeGl(overrides: Record<string, unknown> = {}) {
  const gl: Record<string, unknown> = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    ARRAY_BUFFER: 5,
    STATIC_DRAW: 6,
    FLOAT: 7,
    TEXTURE0: 8,
    TEXTURE_2D: 9,
    TEXTURE_WRAP_S: 10,
    TEXTURE_WRAP_T: 11,
    CLAMP_TO_EDGE: 12,
    TEXTURE_MIN_FILTER: 13,
    TEXTURE_MAG_FILTER: 14,
    LINEAR: 15,
    RGBA: 16,
    UNSIGNED_BYTE: 17,
    COLOR_BUFFER_BIT: 18,
    TRIANGLE_STRIP: 19,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => "bad shader"),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getProgramInfoLog: vi.fn(() => "bad program"),
    deleteProgram: vi.fn(),
    useProgram: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    getUniformLocation: vi.fn((_: unknown, name: string) => ({ name })),
    createTexture: vi.fn(() => ({})),
    activeTexture: vi.fn(),
    bindTexture: vi.fn(),
    texParameteri: vi.fn(),
    texImage2D: vi.fn(),
    uniform1i: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    viewport: vi.fn(),
    drawArrays: vi.fn(),
    isContextLost: vi.fn(() => false),
    deleteTexture: vi.fn(),
    deleteBuffer: vi.fn(),
    getExtension: vi.fn(() => ({ loseContext: vi.fn() })),
    ...overrides,
  };
  return gl;
}

function canvasWith(gl: Record<string, unknown> | null) {
  const canvas = document.createElement("canvas");
  canvas.getContext = vi.fn(() => gl) as unknown as typeof canvas.getContext;
  return canvas;
}

const OPTIONS = {
  variant: "card" as const,
  intensity: 0.8,
  frame: 0.045,
  radius: 14,
  seed: 0.5,
  maxTilt: 18,
};

describe("createHoloRenderer", () => {
  it("returns null without WebGL", () => {
    expect(createHoloRenderer(canvasWith(null), OPTIONS)).toBeNull();
  });

  it("throws with the shader log when compilation fails", () => {
    const gl = fakeGl({ getShaderParameter: vi.fn(() => false) });
    expect(() => createHoloRenderer(canvasWith(gl), OPTIONS)).toThrow(/bad shader/);
  });

  it("throws with the program log when linking fails", () => {
    const gl = fakeGl({ getProgramParameter: vi.fn(() => false) });
    expect(() => createHoloRenderer(canvasWith(gl), OPTIONS)).toThrow(/bad program/);
  });

  it("draws only once a texture and a size are known", () => {
    const gl = fakeGl();
    const canvas = canvasWith(gl);
    const renderer = createHoloRenderer(canvas, OPTIONS);
    expect(renderer).not.toBeNull();

    renderer?.render(REST_STATE, 1);
    expect(gl.drawArrays).not.toHaveBeenCalled();

    renderer?.resize(300, 400, 2);
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(800);
    expect(gl.drawArrays).not.toHaveBeenCalled();

    const image = Object.assign(document.createElement("img"), {});
    Object.defineProperty(image, "naturalWidth", { value: 900 });
    Object.defineProperty(image, "naturalHeight", { value: 1200 });
    renderer?.setImage(image);
    expect(gl.texImage2D).toHaveBeenCalled();
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: "uTexSize" }, 900, 1200);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);

    renderer?.render({ ...REST_STATE, rx: 9, ry: -18, mx: 25, my: 75, active: 1 }, 2);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: "uTilt" }, 0.5, -1);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: "uLight" }, 0.25, 0.75);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: "uTime" }, 2);
    expect(gl.drawArrays).toHaveBeenCalledTimes(2);

    renderer?.dispose();
    expect(gl.deleteProgram).toHaveBeenCalled();
    expect(gl.deleteTexture).toHaveBeenCalled();
  });

  it("paints a disc without a frame", () => {
    const gl = fakeGl();
    createHoloRenderer(canvasWith(gl), { ...OPTIONS, variant: "disc", maxTilt: 0 });
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: "uVariant" }, 1);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: "uFrame" }, 0);
  });

  it("skips drawing while the context is lost", () => {
    const gl = fakeGl({ isContextLost: vi.fn(() => true) });
    const renderer = createHoloRenderer(canvasWith(gl), OPTIONS);
    renderer?.resize(10, 10, 1);
    renderer?.setImage(document.createElement("img"));
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});

describe("seedFromString", () => {
  it("is deterministic and bounded", () => {
    const a = seedFromString("https://a.storyblok.com/f/1/x.jpg");
    expect(a).toBe(seedFromString("https://a.storyblok.com/f/1/x.jpg"));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
    expect(seedFromString("other")).not.toBe(a);
  });
});
