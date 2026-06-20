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
  it("returns rgb/rgba and a white text colour for dark artwork", async () => {
    getColorSync.mockReturnValue({ rgb: () => ({ r: 10, g: 20, b: 30 }), isDark: true });

    const result = await extractVibrantColor("https://img.test/a.jpg");

    expect(result).toEqual({
      rgb: "rgb(10, 20, 30)",
      rgba: "rgba(10, 20, 30, 0.9)",
      textColor: "white",
    });
  });

  it("uses black text for light artwork", async () => {
    getColorSync.mockReturnValue({ rgb: () => ({ r: 240, g: 240, b: 240 }), isDark: false });

    const result = await extractVibrantColor("https://img.test/light.jpg");

    expect(result?.textColor).toBe("black");
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
