import { getResponsiveImage } from "@httpjpg/storyblok-utils";

import { workFloatingMedia } from "./work-floating-media";

const PHOTO = "https://a.storyblok.com/f/1/800x600/abc/still.jpg";
const CLIP = "https://a.storyblok.com/f/1/clip.mp4";

describe("workFloatingMedia", () => {
  it("maps an image asset through the responsive image service", () => {
    const expected = getResponsiveImage(PHOTO, { widths: [400, 800, 1200] });

    expect(
      workFloatingMedia({
        _uid: "w",
        component: "work",
        floating_media: [
          {
            _uid: "i1",
            component: "floating_item",
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
      workFloatingMedia({
        _uid: "w",
        component: "work",
        floating_media: [
          {
            _uid: "v1",
            component: "floating_item",
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
      workFloatingMedia({
        _uid: "w",
        component: "work",
        floating_media: [
          {
            _uid: "u1",
            component: "floating_item",
            name: "Poster",
            url: "https://cdn.example/poster.png",
          },
          { _uid: "u2", component: "floating_item", name: "  ", url: "https://cdn.example/x.png" },
          { _uid: "u3", component: "floating_item", name: "Nope", url: "" },
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
    expect(workFloatingMedia({ _uid: "w", component: "work" } as never)).toEqual([]);
  });

  it("honours the width dropdown and ignores unknown values", () => {
    const expected = getResponsiveImage(PHOTO, { widths: [240, 480, 720] });

    expect(
      workFloatingMedia({
        _uid: "w",
        component: "work",
        floating_media: [
          {
            _uid: "i1",
            component: "floating_item",
            name: "Still",
            file: { filename: PHOTO },
            width: "240",
          },
          {
            _uid: "i2",
            component: "floating_item",
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
        mediaWidth: undefined,
        mediaHeight: undefined,
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
