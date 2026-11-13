import { getResponsiveImage } from "@httpjpg/storyblok-utils";

import { storyblokAssetDimensions, workDesktopMedia } from "./work-desktop-media";

const PHOTO = "https://a.storyblok.com/f/1/800x600/abc/still.jpg";
const CLIP = "https://a.storyblok.com/f/1/clip.mp4";

describe("workDesktopMedia", () => {
  it("maps an image asset through the responsive image service", () => {
    const expected = getResponsiveImage(PHOTO, { widths: [400, 800, 1200] });

    expect(
      workDesktopMedia({
        _uid: "w",
        component: "work",
        desktop_media: [
          {
            _uid: "i1",
            component: "desktop_media_item",
            name: "Still",
            file: { filename: PHOTO, alt: "A still", width: 800, height: 600 },
          },
        ],
      } as never),
    ).toEqual([
      {
        id: "i1",
        name: "Still",
        src: expected.src,
        srcSet: expected.srcSet,
        sizes: "(max-width: 416px) calc(100vw - 16px), 400px",
        width: 400,
        kind: "image",
        alt: "A still",
        mediaWidth: 800,
        mediaHeight: 600,
      },
    ]);
  });

  it("maps a video asset as native video", () => {
    expect(
      workDesktopMedia({
        _uid: "w",
        component: "work",
        desktop_media: [
          {
            _uid: "v1",
            component: "desktop_media_item",
            name: "Showreel",
            file: { filename: CLIP, content_type: "video/mp4" },
          },
        ],
      } as never),
    ).toEqual([
      {
        id: "v1",
        name: "Showreel",
        src: CLIP,
        width: 400,
        kind: "video",
        alt: "Showreel",
        mediaWidth: undefined,
        mediaHeight: undefined,
      },
    ]);
  });

  it("falls back to a pasted URL and drops empty rows", () => {
    expect(
      workDesktopMedia({
        _uid: "w",
        component: "work",
        desktop_media: [
          {
            _uid: "u1",
            component: "desktop_media_item",
            name: "Poster",
            url: "https://cdn.example/poster.png",
          },
          {
            _uid: "u2",
            component: "desktop_media_item",
            name: "  ",
            url: "https://cdn.example/x.png",
          },
          { _uid: "u3", component: "desktop_media_item", name: "Nope", url: "" },
        ],
      } as never),
    ).toEqual([
      {
        id: "u1",
        name: "Poster",
        src: "https://cdn.example/poster.png",
        width: 400,
        kind: undefined,
        alt: "Poster",
        mediaWidth: undefined,
        mediaHeight: undefined,
      },
    ]);
  });

  it("returns nothing when the field is missing", () => {
    expect(workDesktopMedia({ _uid: "w", component: "work" } as never)).toEqual([]);
  });

  it("honours the width dropdown and ignores unknown values", () => {
    const expected = getResponsiveImage(PHOTO, { widths: [240, 480, 720] });

    expect(
      workDesktopMedia({
        _uid: "w",
        component: "work",
        desktop_media: [
          {
            _uid: "i1",
            component: "desktop_media_item",
            name: "Still",
            file: { filename: PHOTO },
            width: "240",
          },
          {
            _uid: "i2",
            component: "desktop_media_item",
            name: "Nope",
            url: "https://cdn.example/x.png",
            width: "999",
          },
        ],
      } as never),
    ).toEqual([
      {
        id: "i1",
        name: "Still",
        src: expected.src,
        srcSet: expected.srcSet,
        sizes: "(max-width: 256px) calc(100vw - 16px), 240px",
        width: 240,
        kind: "image",
        alt: "Still",
        mediaWidth: 800,
        mediaHeight: 600,
      },
      {
        id: "i2",
        name: "Nope",
        src: "https://cdn.example/x.png",
        width: 400,
        kind: undefined,
        alt: "Nope",
        mediaWidth: undefined,
        mediaHeight: undefined,
      },
    ]);
  });
});

describe("storyblokAssetDimensions", () => {
  it("reads the natural size from the CDN path", () => {
    expect(storyblokAssetDimensions(PHOTO)).toEqual({ width: 800, height: 600 });
    expect(storyblokAssetDimensions("//a.storyblok.com/f/42/1080x1920/h/tall.png")).toEqual({
      width: 1080,
      height: 1920,
    });
  });

  it("answers nothing for videos, zero sizes and foreign URLs", () => {
    expect(storyblokAssetDimensions("https://a.storyblok.com/f/1/x/abc/clip.mp4")).toBeUndefined();
    expect(
      storyblokAssetDimensions("https://a.storyblok.com/f/1/0x0/abc/zero.svg"),
    ).toBeUndefined();
    expect(storyblokAssetDimensions("https://cdn.example/640x480/poster.png")).toBeUndefined();
    expect(storyblokAssetDimensions("")).toBeUndefined();
  });
});
