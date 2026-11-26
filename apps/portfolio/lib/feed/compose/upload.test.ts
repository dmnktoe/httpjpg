import { beforeEach, vi } from "vitest";

vi.mock("./api", () => ({ signUpload: vi.fn() }));

import { signUpload } from "./api";
import { prepareFile, prepareImage, uploadFile } from "./upload";

const drawImage = vi.fn();
const close = vi.fn();
const fetchMock = vi.fn();
let encoded: Blob | null;

function file(name: string, type: string): File {
  return new File(["bytes"], name, { type });
}

beforeEach(() => {
  drawImage.mockReset();
  close.mockReset();
  fetchMock.mockReset().mockResolvedValue(new Response(null));
  encoded = new Blob(["out"]);
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => ({ width: 8000, height: 4000, close })),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as never);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function toBlob(callback) {
    callback(encoded);
  });
});

describe("prepareImage", () => {
  it("draws the whole picture again, capped on its long side", async () => {
    const prepared = await prepareImage(file("IMG_1.HEIC", "image/heic"), "post-1");

    expect(prepared).toMatchObject({ filename: "post-1.jpg", width: 4096, height: 2048 });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 8000, 4000, 0, 0, 4096, 2048);
    expect(createImageBitmap).toHaveBeenCalledWith(expect.any(File), {
      imageOrientation: "from-image",
    });
    expect(close).toHaveBeenCalled();
  });

  it("draws only the crop when there is one", async () => {
    const prepared = await prepareImage(file("a.jpg", "image/jpeg"), "post-2", {
      x: 100,
      y: 50,
      width: 1000,
      height: 1250,
    });

    expect(prepared).toMatchObject({ width: 1000, height: 1250 });
    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),
      100,
      50,
      1000,
      1250,
      0,
      0,
      1000,
      1250,
    );
  });

  it("keeps a PNG a PNG", async () => {
    expect((await prepareImage(file("a.png", "image/png"), "post-1")).filename).toBe("post-1.png");
  });

  it("leaves a GIF alone", async () => {
    const gif = file("a.gif", "image/gif");

    expect(await prepareImage(gif, "post-1")).toEqual({ blob: gif, filename: "post-1.gif" });
    expect(drawImage).not.toHaveBeenCalled();
  });

  it("fails when the browser cannot encode", async () => {
    encoded = null;

    await expect(prepareImage(file("a.jpg", "image/jpeg"), "post-1")).rejects.toThrow(/encode/);
  });
});

describe("prepareFile", () => {
  it("renames the file and keeps its extension", () => {
    const video = file("Clip.MOV", "video/quicktime");

    expect(prepareFile(video, "post-3")).toEqual({ blob: video, filename: "post-3.mov" });
    expect(prepareFile(file("noext", ""), "track").filename).toBe("track.bin");
  });
});

describe("uploadFile", () => {
  it("signs with the size, then posts the fields and the file to the storage", async () => {
    vi.mocked(signUpload).mockResolvedValue({
      id: 9,
      uploadUrl: "https://s3.test/bucket",
      fields: { key: "f/1/a.jpg", policy: "p" },
    });

    const id = await uploadFile({
      blob: new Blob(["x"]),
      filename: "post-1.jpg",
      width: 10,
      height: 20,
    });

    expect(id).toBe(9);
    expect(signUpload).toHaveBeenCalledWith({ filename: "post-1.jpg", width: 10, height: 20 });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://s3.test/bucket");
    expect(init).toMatchObject({ method: "POST", mode: "no-cors" });
    const form = init.body as FormData;
    expect(form.get("key")).toBe("f/1/a.jpg");
    expect((form.get("file") as File).name).toBe("post-1.jpg");
  });

  it("signs without a size for a file that has none", async () => {
    vi.mocked(signUpload).mockResolvedValue({ id: 1, uploadUrl: "https://s3.test", fields: {} });

    await uploadFile({ blob: new Blob(["x"]), filename: "track.mp3" });

    expect(signUpload).toHaveBeenLastCalledWith({ filename: "track.mp3" });
  });
});
