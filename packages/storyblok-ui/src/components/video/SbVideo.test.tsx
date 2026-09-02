import { fireEvent, render, screen, within } from "@testing-library/react";

import { SbVideo } from "./SbVideo";

const clip = "https://a.storyblok.com/f/1/clip.mp4";

describe("SbVideo", () => {
  it("returns null when no source resolves", () => {
    const { container } = render(<SbVideo blok={{ _uid: "1", component: "video" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a native video when a filename is set", () => {
    const { container } = render(
      <SbVideo
        blok={
          {
            _uid: "2",
            component: "video",
            source: "native",
            video: { filename: "https://a.storyblok.com/f/1/clip.mp4" },
          } as never
        }
      />,
    );
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("offers no lightbox trigger unless the blok asks for one", () => {
    render(
      <SbVideo
        blok={
          { _uid: "4", component: "video", source: "native", video: { filename: clip } } as never
        }
      />,
    );
    expect(screen.queryByRole("button", { name: /full size/i })).not.toBeInTheDocument();
  });

  it("opens the video at full size from the corner trigger", () => {
    render(
      <SbVideo
        blok={
          {
            _uid: "5",
            component: "video",
            source: "native",
            video: { filename: clip, copyright: "2025 Studio", source: "peach.blender.org" },
            lightbox: true,
          } as never
        }
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play the video at full size" }));

    const dialog = screen.getByRole("dialog", { name: "Image viewer" });
    expect(dialog).toBeInTheDocument();
    // Scoped to the dialog: the inline player carries its own credit too.
    expect(within(dialog).getByText("© 2025 Studio")).toBeInTheDocument();
    expect(within(dialog).getByText("peach.blender.org")).toBeInTheDocument();
  });

  it("pauses the inline player so the two soundtracks cannot stack", () => {
    const pause = vi
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => undefined);

    try {
      render(
        <SbVideo
          blok={
            {
              _uid: "6",
              component: "video",
              source: "native",
              video: { filename: clip },
              lightbox: true,
            } as never
          }
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Play the video at full size" }));

      expect(pause).toHaveBeenCalled();
    } finally {
      pause.mockRestore();
    }
  });

  it("renders a consent placeholder for an embed source without consent", () => {
    const { container } = render(
      <SbVideo
        blok={
          {
            _uid: "3",
            component: "video",
            source: "youtube",
            videoUrl: "https://youtube.com/watch?v=abc",
          } as never
        }
      />,
    );
    // No <video> element — the consent placeholder renders instead.
    expect(container.querySelector("video")).toBeNull();
    expect(container.firstChild).not.toBeNull();
  });

  it("falls back to videoUrl for native clips and sizes string dimensions", () => {
    const { container } = render(
      <SbVideo
        blok={
          {
            _uid: "7",
            component: "video",
            source: "native",
            videoUrl: "https://cdn.example/clip.mp4",
            video: { width: "640", height: "360" },
            poster: { filename: "https://cdn.example/poster.jpg" },
            aspectRatio: " 16/9 ",
            caption: { content: [{ type: "paragraph", content: [{ type: "text", text: "Cap" }] }] },
          } as never
        }
      />,
    );
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("renders a Vimeo consent placeholder", () => {
    const { container } = render(
      <SbVideo
        blok={
          {
            _uid: "8",
            component: "video",
            source: "vimeo",
            videoUrl: "https://vimeo.com/1",
          } as never
        }
      />,
    );
    expect(container.querySelector("video")).toBeNull();
    expect(container.firstChild).not.toBeNull();
  });
});
