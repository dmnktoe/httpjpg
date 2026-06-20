import { firstImageFilename, isVideoAsset, toSlideshowImage } from "./media-utils";

describe("isVideoAsset", () => {
  it("detects videos by content type", () => {
    expect(isVideoAsset({ content_type: "video/mp4" })).toBe(true);
  });

  it("detects videos by file extension", () => {
    expect(isVideoAsset({ filename: "https://a.storyblok.com/f/1/clip.webm" })).toBe(true);
    expect(isVideoAsset({ filename: "https://a.storyblok.com/f/1/clip.mp4?cache=1" })).toBe(true);
  });

  it("treats images as non-video", () => {
    expect(isVideoAsset({ filename: "https://a.storyblok.com/f/1/photo.jpg" })).toBe(false);
    expect(isVideoAsset({})).toBe(false);
  });
});

describe("toSlideshowImage", () => {
  it("maps a video asset with an empty url and a videoUrl", () => {
    const result = toSlideshowImage(
      { filename: "https://a.storyblok.com/f/1/clip.mp4", title: "Clip" },
      "fallback",
    );
    expect(result.url).toBe("");
    expect(result.videoUrl).toBe("https://a.storyblok.com/f/1/clip.mp4");
    expect(result.alt).toBe("Clip");
  });

  it("maps an image asset to a responsive url and srcSet", () => {
    const result = toSlideshowImage(
      { filename: "https://a.storyblok.com/f/1/photo.jpg", alt: "Photo" },
      "fallback",
    );
    expect(result.url).toContain("/m/");
    expect(result.srcSet).toBeTruthy();
    expect(result.alt).toBe("Photo");
  });

  it("falls back to the provided alt when the asset has none", () => {
    const result = toSlideshowImage(
      { filename: "https://a.storyblok.com/f/1/photo.jpg" },
      "default alt",
    );
    expect(result.alt).toBe("default alt");
  });
});

describe("firstImageFilename", () => {
  it("returns undefined for an empty or missing list", () => {
    expect(firstImageFilename(undefined)).toBeUndefined();
    expect(firstImageFilename([])).toBeUndefined();
  });

  it("returns the first non-video filename", () => {
    expect(
      firstImageFilename([
        { filename: "https://a.storyblok.com/f/1/clip.mp4" },
        { filename: "https://a.storyblok.com/f/1/photo.jpg" },
      ]),
    ).toBe("https://a.storyblok.com/f/1/photo.jpg");
  });

  it("returns undefined when every asset is a video", () => {
    expect(
      firstImageFilename([{ filename: "https://a.storyblok.com/f/1/clip.mov" }]),
    ).toBeUndefined();
  });
});
