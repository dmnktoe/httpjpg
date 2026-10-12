import { collectSchemaMedia } from "./schema-media";

const context = { name: "Project", description: "About it", uploadDate: "2024-01-01" };

function caption(text: string) {
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

describe("collectSchemaMedia", () => {
  it("collects featured and inline images once each, with credit", () => {
    const media = collectSchemaMedia(
      {
        images: [{ filename: "https://cdn/a.jpg", alt: "Alt A", copyright: "© Studio" }],
        body: [
          { component: "image", image: { filename: "https://cdn/a.jpg" } },
          { component: "image", image: { filename: "https://cdn/b.jpg" }, caption: caption("B") },
          {
            component: "image_comparison",
            before: { filename: "https://cdn/c.jpg" },
            beforeAlt: "Before",
            after: { filename: "https://cdn/d.mp4", content_type: "video/mp4" },
          },
          { component: "slideshow", images: [{ filename: "https://cdn/e.jpg" }, "junk"] },
        ],
      },
      context,
    );

    expect(media.images).toEqual([
      {
        "@type": "ImageObject",
        contentUrl: "https://cdn/a.jpg",
        caption: "Alt A",
        creditText: "© Studio",
        copyrightNotice: "© Studio",
      },
      { "@type": "ImageObject", contentUrl: "https://cdn/b.jpg", caption: "B" },
      { "@type": "ImageObject", contentUrl: "https://cdn/c.jpg", caption: "Before" },
      { "@type": "ImageObject", contentUrl: "https://cdn/e.jpg" },
    ]);
  });

  it("describes native and embedded videos that have a poster", () => {
    const poster = { filename: "https://cdn/poster.jpg" };
    const media = collectSchemaMedia(
      [
        { component: "video", video: { filename: "https://cdn/v.mp4" }, poster },
        {
          component: "video",
          source: "youtube",
          videoUrl: "https://youtu.be/x",
          poster,
          caption: caption("Teaser"),
        },
        { component: "video", video: { filename: "https://cdn/no-poster.mp4" } },
        { component: "video", source: "vimeo", poster },
      ],
      context,
    );

    expect(media.videos).toEqual([
      {
        "@type": "VideoObject",
        name: "Project",
        description: "About it",
        thumbnailUrl: "https://cdn/poster.jpg",
        uploadDate: "2024-01-01",
        contentUrl: "https://cdn/v.mp4",
      },
      expect.objectContaining({ name: "Teaser", embedUrl: "https://youtu.be/x" }),
    ]);
  });

  it("drops videos without an upload date", () => {
    const media = collectSchemaMedia(
      { component: "video", video: { filename: "https://cdn/v.mp4" }, poster: { filename: "p" } },
      { name: "Project" },
    );

    expect(media.videos).toEqual([]);
  });

  it("describes music players as recordings", () => {
    const media = collectSchemaMedia(
      [
        {
          component: "music_player",
          source: "mp3",
          src: "https://cdn/song.mp3",
          title: "Song",
          artist: "Band",
          artwork: "https://cdn/art.jpg",
        },
        {
          component: "music_player",
          source: "spotify",
          src: "https://open.spotify.com/x",
          title: "S",
        },
        { component: "music_player", src: "https://open.spotify.com/y" },
      ],
      context,
    );

    expect(media.recordings).toEqual([
      {
        "@type": "MusicRecording",
        name: "Song",
        byArtist: { "@type": "MusicGroup", name: "Band" },
        image: "https://cdn/art.jpg",
        audio: {
          "@type": "AudioObject",
          contentUrl: "https://cdn/song.mp3",
          encodingFormat: "audio/mpeg",
        },
      },
      { "@type": "MusicRecording", name: "S", url: "https://open.spotify.com/x" },
    ]);
  });

  it("tolerates empty content", () => {
    expect(collectSchemaMedia(undefined, context)).toEqual({
      images: [],
      videos: [],
      recordings: [],
    });
  });
});
