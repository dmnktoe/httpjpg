import { render, screen } from "@testing-library/react";

import { BLOK_REGISTRY, blokPlugin } from "./bloks";
import { emptySpacing } from "./lib";

describe("blokPlugin", () => {
  it("looks up a registered plugin and ignores unknown types", () => {
    expect(blokPlugin("headline")?.label).toBe("Headline");
    expect(blokPlugin("nope")).toBeUndefined();
  });
});

describe("BLOK_REGISTRY", () => {
  it("round-trips serialize/deserialize for every plugin", () => {
    for (const plugin of BLOK_REGISTRY) {
      const serialized = plugin.serialize(plugin.defaults);
      const back = plugin.deserialize(serialized);
      expect(plugin.serialize(back)).toEqual(serialized);
    }
  });

  it("renders a preview for every plugin without throwing", () => {
    for (const plugin of BLOK_REGISTRY) {
      const { unmount } = render(
        <div data-testid={plugin.type}>{plugin.preview(plugin.defaults)}</div>,
      );
      expect(screen.getByTestId(plugin.type)).toBeInTheDocument();
      unmount();
    }
  });

  it("fills media placeholders when urls are missing and renders when they are set", () => {
    const image = blokPlugin("image")!;
    const { unmount: unmountEmpty } = render(<>{image.preview({ imageUrl: "", alt: "" })}</>);
    expect(screen.getByText("IMAGE")).toBeInTheDocument();
    unmountEmpty();

    const { unmount: unmountFilled } = render(
      <>{image.preview({ imageUrl: "https://example.com/a.jpg", alt: "A" })}</>,
    );
    expect(screen.getByAltText("A")).toBeInTheDocument();
    unmountFilled();

    const video = blokPlugin("video")!;
    const { unmount: unmountVideo } = render(
      <>{video.preview({ videoUrl: "", source: "native" })}</>,
    );
    expect(screen.getByText("VIDEO")).toBeInTheDocument();
    unmountVideo();

    const compare = blokPlugin("image_comparison")!;
    const { unmount: unmountCompare } = render(
      <>{compare.preview({ beforeUrl: "", afterUrl: "" })}</>,
    );
    expect(screen.getByText("COMPARE")).toBeInTheDocument();
    unmountCompare();

    const music = blokPlugin("music_player")!;
    const { unmount: unmountMusic } = render(<>{music.preview({ spotifyUrl: "" })}</>);
    expect(screen.getByText("MUSIC PLAYER")).toBeInTheDocument();
    unmountMusic();
  });

  it("unwraps Storyblok asset / link / richtext shapes", () => {
    expect(blokPlugin("button")!.deserialize({ link: { url: "/x" } }).linkUrl).toBe("/x");
    expect(blokPlugin("button")!.serialize({ text: "Go", linkUrl: "/x" }).link).toEqual({
      url: "/x",
      linktype: "url",
    });
    expect(blokPlugin("image")!.deserialize({ image: { filename: "a.jpg", alt: "A" } })).toEqual({
      imageUrl: "a.jpg",
      alt: "A",
    });
    expect(
      blokPlugin("richtext")!.deserialize({
        content: { content: [{ content: [{ text: "Hi" }] }] },
      }).content,
    ).toBe("Hi");
    expect(blokPlugin("work_card")!.serialize({ workUuid: "abc" })).toEqual({ work: "abc" });
  });

  it("clamps headline levels and renders optional media", () => {
    const headline = blokPlugin("headline")!;
    const { unmount: u1 } = render(
      <>{headline.preview({ text: "H", level: "1", align: "center" })}</>,
    );
    expect(screen.getByText("H")).toBeInTheDocument();
    u1();
    const { unmount: u2 } = render(<>{headline.preview({ text: "H", level: "9" })}</>);
    expect(screen.getByText("H")).toBeInTheDocument();
    u2();

    const video = blokPlugin("video")!;
    const { unmount: u3 } = render(
      <>{video.preview({ videoUrl: "https://youtu.be/x", source: "youtube" })}</>,
    );
    u3();

    const compare = blokPlugin("image_comparison")!;
    const { unmount: u4 } = render(
      <>
        {compare.preview({
          beforeUrl: "https://example.com/a.jpg",
          afterUrl: "https://example.com/b.jpg",
        })}
      </>,
    );
    u4();

    const music = blokPlugin("music_player")!;
    const { unmount: u5 } = render(<>{music.preview({ spotifyUrl: "spotify:track:1" })}</>);
    u5();

    expect(blokPlugin("button")!.serialize({ text: "Go" }).link).toEqual({ linktype: "url" });
    expect(blokPlugin("richtext")!.serialize({ content: "" })).toEqual({
      content: { type: "doc", content: [] },
    });
    expect(blokPlugin("image")!.serialize({ imageUrl: "", alt: "" }).image).toBeNull();
    expect(blokPlugin("work_card")!.preview({ workUuid: "abc" })).toBeTruthy();
    expect(blokPlugin("image")!.serialize({ imageUrl: "a.jpg", alt: "A" }).image).toEqual({
      filename: "a.jpg",
      alt: "A",
    });
    expect(
      blokPlugin("image_comparison")!.serialize({ beforeUrl: "a.jpg", afterUrl: "b.jpg" }),
    ).toEqual({
      before: { filename: "a.jpg" },
      after: { filename: "b.jpg" },
    });
    expect(blokPlugin("richtext")!.serialize({ content: "Hi" })).toMatchObject({
      content: { type: "doc", content: [{ type: "paragraph" }] },
    });
    expect(blokPlugin("button")!.preview({ text: "Go", variant: "", size: "" })).toBeTruthy();
  });
});

describe("empty spacing on a preview item", () => {
  it("is the shape canvas items start with", () => {
    expect(emptySpacing()).toEqual({ base: {}, md: {}, lg: {} });
  });
});
