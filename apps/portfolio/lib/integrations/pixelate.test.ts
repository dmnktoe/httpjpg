// @vitest-environment node
import sharp from "sharp";
import { beforeEach, vi } from "vitest";

const { safeFetch, readLimited } = vi.hoisted(() => ({
  safeFetch: vi.fn(),
  readLimited: vi.fn(),
}));

vi.mock("./favicon", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./favicon")>()),
  safeFetch,
  readLimited,
}));

import { PIXEL_GRID, pixelateEach, pixelateImage } from "./pixelate";

const COVER = "https://covers.test/a.jpg";

function image(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 4, background: { r: 200, g: 30, b: 30, alpha: 1 } },
  })
    .png()
    .toBuffer();
}

async function size(uri: string | null) {
  expect(uri).toMatch(/^data:image\/png;base64,/);
  const { width, height } = await sharp(Buffer.from(uri!.split(",")[1], "base64")).metadata();
  return { width, height };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("pixelateImage", () => {
  it("shrinks a square thumb to one cell per CSS pixel", async () => {
    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(await image(300, 300));

    const uri = await pixelateImage(COVER, { width: PIXEL_GRID.thumb, height: PIXEL_GRID.thumb });

    await expect(size(uri)).resolves.toEqual({ width: 12, height: 12 });
    expect(safeFetch.mock.calls[0][0].href).toBe(COVER);
  });

  it("keeps a poster's proportions when only the width is given", async () => {
    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(await image(200, 300));

    await expect(size(await pixelateImage(COVER, { width: 12 }))).resolves.toEqual({
      width: 12,
      height: 18,
    });
  });

  it("letterboxes into the grid with contain", async () => {
    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(await image(200, 100));

    const uri = await pixelateImage(COVER, { width: 16, height: 16, fit: "contain" });

    await expect(size(uri)).resolves.toEqual({ width: 16, height: 16 });
  });

  it("leaves out a missing, non-http, refused, oversized or broken image", async () => {
    await expect(pixelateImage(null, { width: 12 })).resolves.toBeNull();
    await expect(pixelateImage("file:///etc/passwd", { width: 12 })).resolves.toBeNull();
    expect(safeFetch).not.toHaveBeenCalled();

    safeFetch.mockResolvedValueOnce(null);
    await expect(pixelateImage(COVER, { width: 12 })).resolves.toBeNull();

    safeFetch.mockResolvedValueOnce({ ok: false });
    await expect(pixelateImage(COVER, { width: 12 })).resolves.toBeNull();

    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(null);
    await expect(pixelateImage(COVER, { width: 12 })).resolves.toBeNull();

    safeFetch.mockResolvedValueOnce({ ok: true });
    readLimited.mockResolvedValueOnce(Buffer.from("not an image"));
    await expect(pixelateImage(COVER, { width: 12 })).resolves.toBeNull();
  });
});

describe("pixelateEach", () => {
  it("replaces one field on every item and leaves the rest", async () => {
    safeFetch.mockResolvedValue({ ok: true });
    readLimited.mockResolvedValue(await image(64, 64));

    const items = await pixelateEach(
      [
        { title: "a", image: COVER as string | null },
        { title: "b", image: null },
      ],
      "image",
      { width: 12, height: 12 },
    );

    expect(items[0].title).toBe("a");
    expect(items[0].image).toMatch(/^data:image\/png/);
    expect(items[1]).toEqual({ title: "b", image: null });
  });
});
