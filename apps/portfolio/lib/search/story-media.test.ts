import { collectStoryMedia } from "./story-media";

const IMAGE_BLOK = {
  component: "image",
  _uid: "image-1",
  alt: "Print run",
  image: { filename: "https://a.storyblok.com/f/1/2x2/abc/print.jpeg" },
};

const MUSIC_BLOK = {
  component: "music_player",
  _uid: "player-1",
  title: "mega mashup",
  artist: "te3shay",
  artwork: "https://a.storyblok.com/f/1/811x811/def/img_4103.JPG",
};

describe("collectStoryMedia", () => {
  it("returns an empty list for content without media", () => {
    expect(collectStoryMedia({ component: "page", body: [{ component: "headline" }] })).toEqual([]);
  });

  it("collects image bloks nested in a grid", () => {
    const media = collectStoryMedia({
      component: "page",
      body: [
        {
          component: "grid",
          items: [{ component: "grid_item", content: [IMAGE_BLOK] }],
        },
      ],
    });

    expect(media).toHaveLength(1);
    expect(media[0]).toMatchObject({ id: "image-1", kind: "image", label: "Print run" });
    expect(media[0].thumb).toContain("/m/200x0/");
  });

  it("carries the unprocessed asset and its focal point", () => {
    const media = collectStoryMedia({
      component: "page",
      body: [{ ...IMAGE_BLOK, image: { ...IMAGE_BLOK.image, focus: "1x1:2x2" } }],
    });

    expect(media[0]).toMatchObject({
      source: "https://a.storyblok.com/f/1/2x2/abc/print.jpeg",
      focus: "1x1:2x2",
    });
  });

  it("falls back to the caption when the image has no alt text", () => {
    const media = collectStoryMedia({
      component: "image",
      _uid: "image-2",
      image: { filename: "https://a.storyblok.com/f/1/2x2/abc/a.jpg" },
      caption: {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Berlin, 2024" }] }],
      },
    });

    expect(media[0].label).toBe("Berlin, 2024");
  });

  it("labels a music player with its track and artist", () => {
    const media = collectStoryMedia(MUSIC_BLOK);

    expect(media[0]).toMatchObject({ kind: "audio", label: "mega mashup — te3shay" });
    expect(media[0].thumb).toContain("img_4103.JPG");
  });

  it("keeps a track whose artwork the editor left blank", () => {
    const media = collectStoryMedia({ ...MUSIC_BLOK, artwork: "" });

    expect(media).toHaveLength(1);
    expect(media[0].thumb).toBe("");
  });

  it("flattens slideshow assets and skips videos", () => {
    const media = collectStoryMedia({
      component: "slideshow",
      _uid: "show-1",
      images: [
        { filename: "https://a.storyblok.com/f/1/2x2/abc/one.jpg", alt: "One" },
        { filename: "https://a.storyblok.com/f/1/2x2/abc/clip.mp4" },
        { filename: "https://a.storyblok.com/f/1/2x2/abc/two.jpg", alt: "Two" },
      ],
    });

    expect(media.map((item) => item.label)).toEqual(["One", "Two"]);
  });

  it("collects both sides of an image comparison", () => {
    const media = collectStoryMedia({
      component: "image_comparison",
      _uid: "cmp-1",
      beforeAlt: "Ungraded",
      afterAlt: "Graded",
      before: { filename: "https://a.storyblok.com/f/1/2x2/abc/before.jpg" },
      after: { filename: "https://a.storyblok.com/f/1/2x2/abc/after.jpg" },
    });

    expect(media.map((item) => item.label)).toEqual(["Ungraded", "Graded"]);
  });

  it("uses a video blok's poster", () => {
    const media = collectStoryMedia({
      component: "video",
      _uid: "video-1",
      poster: { filename: "https://a.storyblok.com/f/1/2x2/abc/poster.jpg", alt: "Still" },
    });

    expect(media[0]).toMatchObject({ kind: "video", label: "Still" });
  });

  it("drops a repeated asset so one image cannot fill the strip", () => {
    const media = collectStoryMedia({
      component: "page",
      body: [IMAGE_BLOK, { ...IMAGE_BLOK, _uid: "image-2" }],
    });

    expect(media).toHaveLength(1);
  });

  it("stops at the limit", () => {
    const body = Array.from({ length: 12 }, (_, index) => ({
      ...IMAGE_BLOK,
      _uid: `image-${index}`,
      image: { filename: `https://a.storyblok.com/f/1/2x2/abc/${index}.jpg` },
    }));

    expect(collectStoryMedia({ component: "page", body }, 4)).toHaveLength(4);
  });

  it("leaves external artwork URLs untouched", () => {
    const media = collectStoryMedia({ ...MUSIC_BLOK, artwork: "https://example.com/cover.jpg" });

    expect(media[0].thumb).toBe("https://example.com/cover.jpg");
  });
});
