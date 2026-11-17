import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePixelCrest } from "./use-pixel-crest";

const REMOTE = "https://i.imgur.com/v0tkpNx.png";
const PIXELS = "data:image/png;base64,cGl4ZWxz";

class FakeImage {
  static fails = false;
  static last: FakeImage | null = null;
  crossOrigin = "";
  naturalWidth = 512;
  naturalHeight = 256;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  #src = "";

  get src() {
    return this.#src;
  }

  set src(value: string) {
    this.#src = value;
    FakeImage.last = this;
  }

  settle() {
    if (FakeImage.fails) {
      this.onerror?.();
    } else {
      this.onload?.();
    }
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  FakeImage.fails = false;
  FakeImage.last = null;
});

function stubCanvas() {
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
    imageSmoothingQuality: "low",
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(PIXELS);
  return drawImage;
}

describe("usePixelCrest", () => {
  it("passes a crest the server already pixelated straight through", () => {
    const { result } = renderHook(() => usePixelCrest("data:image/png;base64,aG9tZQ=="));

    expect(result.current).toBe("data:image/png;base64,aG9tZQ==");
  });

  it("shrinks a remote crest to 16px, fitted and centred, once it loads", () => {
    vi.stubGlobal("Image", FakeImage);
    const drawImage = stubCanvas();
    const { result } = renderHook(() => usePixelCrest(REMOTE));

    expect(result.current).toBeNull();
    expect(FakeImage.last?.crossOrigin).toBe("anonymous");

    act(() => FakeImage.last?.settle());

    expect(result.current).toBe(PIXELS);
    expect(drawImage).toHaveBeenCalledWith(FakeImage.last, 0, 4, 16, 8);
  });

  it("leaves the crest out when the image or the canvas fails", () => {
    vi.stubGlobal("Image", FakeImage);
    FakeImage.fails = true;
    const { result } = renderHook(() => usePixelCrest(REMOTE));

    act(() => FakeImage.last?.settle());

    expect(result.current).toBeNull();
  });

  it("answers null without a crest", () => {
    const { result } = renderHook(() => usePixelCrest(null));

    expect(result.current).toBeNull();
  });
});
