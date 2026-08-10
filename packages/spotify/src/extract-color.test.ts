const { getColorSync } = vi.hoisted(() => ({ getColorSync: vi.fn() }));

vi.mock("colorthief", () => ({ getColorSync }));

import { extractVibrantColor } from "./extract-color";

class FakeImage {
  crossOrigin = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  #shouldError = false;
  set src(value: string) {
    this.#shouldError = value === "error";
    queueMicrotask(() => {
      if (this.#shouldError) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("Image", FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("extractVibrantColor", () => {
  it("returns the colour's own css string and text colour", async () => {
    getColorSync.mockReturnValue(fakeColor({ r: 10, g: 20, b: 30 }));

    const result = await extractVibrantColor("https://img.test/a.jpg");

    expect(result?.css).toBe("rgb(10, 20, 30)");
    expect(result?.textColor).toBe("#ffffff");
  });

  it("reads through a wide gamut so P3 artwork keeps its saturation", async () => {
    getColorSync.mockReturnValue(fakeColor({ r: 10, g: 20, b: 30 }));

    await extractVibrantColor("https://img.test/a.jpg");

    expect(getColorSync).toHaveBeenCalledWith(expect.anything(), { gamut: "auto" });
  });

  it("re-alphas an sRGB colour as rgba()", async () => {
    getColorSync.mockReturnValue(fakeColor({ r: 10, g: 20, b: 30 }));

    const result = await extractVibrantColor("https://img.test/a.jpg");

    expect(result?.withAlpha(0.9)).toBe("rgba(10, 20, 30, 0.9)");
    expect(result?.withAlpha(0.2)).toBe("rgba(10, 20, 30, 0.2)");
  });

  it("re-alphas a display-p3 colour in its own gamut", async () => {
    getColorSync.mockReturnValue(
      fakeColor({ r: 218, g: 0, b: 89 }, { gamut: "display-p3", p3: { r: 200, g: 40, b: 90 } }),
    );

    const result = await extractVibrantColor("https://img.test/p3.jpg");

    expect(result?.withAlpha(0.4)).toBe("color(display-p3 0.7843 0.1569 0.3529 / 0.4)");
  });

  it("resolves null when no colour can be extracted", async () => {
    getColorSync.mockReturnValue(null);
    await expect(extractVibrantColor("https://img.test/none.jpg")).resolves.toBeNull();
  });

  it("resolves null when colour extraction throws", async () => {
    getColorSync.mockImplementation(() => {
      throw new Error("decode failed");
    });
    await expect(extractVibrantColor("https://img.test/boom.jpg")).resolves.toBeNull();
  });

  it("resolves null when the image fails to load", async () => {
    await expect(extractVibrantColor("error")).resolves.toBeNull();
  });
});

interface FakeRgb {
  r: number;
  g: number;
  b: number;
}

/** Mirrors the slice of colorthief's Color object that extract-color reads. */
function fakeColor(
  srgb: FakeRgb,
  { gamut = "srgb", p3 }: { gamut?: "srgb" | "display-p3"; p3?: FakeRgb } = {},
) {
  return {
    gamut,
    textColor: "#ffffff",
    css: () => `rgb(${srgb.r}, ${srgb.g}, ${srgb.b})`,
    rgb: (requested?: "srgb" | "display-p3") => (requested === "display-p3" && p3 ? p3 : srgb),
  };
}
