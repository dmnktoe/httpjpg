// @vitest-environment node
import {
  bakedRect,
  type ComposerMedia,
  canCrop,
  existingMedia,
  isMediaFile,
  isVideoFile,
  MAX_MEDIA,
  mediaCrop,
  mediaReducer,
  newMedia,
} from "./media";

function file(name: string, type: string): File {
  return new File(["x"], name, { type });
}

function picture(key: string, patch: Partial<ComposerMedia> = {}): ComposerMedia {
  return {
    ...newMedia(file(`${key}.jpg`, "image/jpeg"), key, `blob:${key}`),
    width: 4000,
    height: 2000,
    ...patch,
  };
}

describe("mediaReducer", () => {
  const state = [picture("a"), picture("b"), picture("c")];
  const keys = (items: ComposerMedia[]) => items.map((item) => item.key);

  it("adds up to the limit", () => {
    const many = Array.from({ length: MAX_MEDIA }, (_, index) => picture(`n${index}`));

    expect(mediaReducer(state, { type: "add", items: many })).toHaveLength(MAX_MEDIA);
  });

  it("removes, moves and resets", () => {
    expect(keys(mediaReducer(state, { type: "remove", key: "b" }))).toEqual(["a", "c"]);
    expect(keys(mediaReducer(state, { type: "move", from: 0, to: 2 }))).toEqual(["b", "c", "a"]);
    expect(keys(mediaReducer(state, { type: "reset", items: [] }))).toEqual([]);
  });

  it("ignores a move that goes nowhere", () => {
    expect(mediaReducer(state, { type: "move", from: 1, to: 1 })).toBe(state);
    expect(mediaReducer(state, { type: "move", from: 9, to: 0 })).toBe(state);
    expect(mediaReducer(state, { type: "move", from: 0, to: -1 })).toBe(state);
    expect(mediaReducer(state, { type: "move", from: 0, to: 3 })).toBe(state);
  });

  it("updates one file", () => {
    const next = mediaReducer(state, { type: "update", key: "b", patch: { alt: "ferry" } });

    expect(next.map((item) => item.alt)).toEqual(["", "ferry", ""]);
  });
});

describe("file kinds", () => {
  it("takes pictures and videos, by type or by name", () => {
    expect(isMediaFile(file("a.jpg", "image/jpeg"))).toBe(true);
    expect(isMediaFile(file("a.MOV", ""))).toBe(true);
    expect(isMediaFile(file("a.pdf", "application/pdf"))).toBe(false);
    expect(isVideoFile(file("a.mp4", "video/mp4"))).toBe(true);
    expect(isVideoFile(file("a.webm", ""))).toBe(true);
    expect(isVideoFile(file("a.jpg", "image/jpeg"))).toBe(false);
  });

  it("starts a new file filled and centred", () => {
    expect(newMedia(file("a.mp4", "video/mp4"), "k", "blob:k")).toMatchObject({
      key: "k",
      kind: "video",
      fit: "cover",
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it("reads a file the post already has", () => {
    const image = { uid: "u1", src: "https://a.storyblok.com/f/1/a.jpg", fit: "contain", alt: "x" };

    expect(existingMedia(image as never)).toMatchObject({
      key: "u1",
      uid: "u1",
      kind: "image",
      fit: "contain",
      alt: "x",
    });
    expect(
      existingMedia({ ...image, src: "https://a.storyblok.com/f/1/a.mp4" } as never).kind,
    ).toBe("video");
  });
});

describe("cropping", () => {
  it("is for new pictures that fill a frame of a fixed shape", () => {
    expect(canCrop(picture("a"), "1/1")).toBe(true);
    expect(canCrop(picture("a"), "original")).toBe(false);
    expect(canCrop(picture("a", { fit: "contain" }), "1/1")).toBe(false);
    expect(canCrop(picture("a", { width: undefined }), "1/1")).toBe(false);
    expect(canCrop(picture("a", { kind: "video" }), "1/1")).toBe(false);
    expect(canCrop(picture("a", { file: undefined, uid: "u" }), "1/1")).toBe(false);
    expect(canCrop(picture("a", { file: file("a.gif", "image/gif") }), "1/1")).toBe(false);
  });

  it("bakes a crop only once the picture was moved or zoomed", () => {
    expect(mediaCrop(picture("a"), "1/1")).toBeNull();
    expect(bakedRect(picture("a"), "1/1")).toBeUndefined();
    expect(mediaCrop(picture("a", { offsetX: 1 }), "original")).toBeNull();

    expect(bakedRect(picture("a", { offsetX: 1 }), "1/1")).toEqual({
      x: 2000,
      y: 0,
      width: 2000,
      height: 2000,
    });
    expect(bakedRect(picture("a", { zoom: 2 }), "4/5")?.width).toBeCloseTo(800);
  });
});
