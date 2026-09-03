import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Video } from "./video";

const { mockReducedMotion } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn(() => false),
}));
vi.mock("motion/react", () => ({ useReducedMotion: () => mockReducedMotion() }));

vi.hoisted(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

describe("Video", () => {
  it("renders a native video with the given src and poster", () => {
    const { container } = render(<Video src="/clip.mp4" poster="/poster.png" controls={false} />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "/clip.mp4");
    expect(video).toHaveAttribute("poster", "/poster.png");
  });

  it("keeps the media hidden until it is ready", () => {
    const { container } = render(<Video src="/clip.mp4" controls={false} />);
    expect(container.querySelector("video")).toHaveStyle({ opacity: "0" });
  });

  it("reveals the media once it has loaded", () => {
    const { container } = render(<Video src="/clip.mp4" controls={false} />);
    const video = container.querySelector("video") as HTMLVideoElement;
    fireEvent.loadedData(video);
    expect(video).toHaveStyle({ opacity: "1" });
  });

  it("falls back to the poster instead of a stuck skeleton when the video errors", () => {
    const { container } = render(<Video src="/broken.mp4" poster="/poster.png" controls={false} />);
    const video = container.querySelector("video") as HTMLVideoElement;
    fireEvent.error(video);
    expect(video).toHaveStyle({ opacity: "1" });
  });

  it("sets the muted property imperatively for reliable autoplay", () => {
    const { container } = render(<Video src="/clip.mp4" autoPlay muted controls={false} />);
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.muted).toBe(true);
  });

  it("kicks muted autoplay on mount so remounts start playing", () => {
    const play = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);

    render(<Video src="/clip.mp4" autoPlay muted controls={false} />);

    expect(play).toHaveBeenCalled();
    play.mockRestore();
  });

  it("defaults to object-fit cover when a fixed aspect ratio is set", () => {
    const { container: covered } = render(
      <Video src="/clip.mp4" aspectRatio="16/9" controls={false} />,
    );
    expect(covered.querySelector("video")).toHaveStyle({ objectFit: "cover" });

    const { container: contained } = render(
      <Video src="/clip.mp4" aspectRatio="16/9" objectFit="contain" controls={false} />,
    );
    expect(contained.querySelector("video")).toHaveStyle({ objectFit: "contain" });
  });

  it("uses intrinsic layout for native video without an aspect ratio", () => {
    const { container } = render(<Video src="/clip.mp4" controls={false} />);
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.style.objectFit).toBe("");
  });

  it("treats an empty aspect ratio like unset", () => {
    const { container } = render(<Video src="/clip.mp4" aspectRatio="" controls={false} />);
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.style.objectFit).toBe("");
    expect(
      container.querySelector('[class*="pos_absolute"][class*="inset_0"][class*="z_1"]'),
    ).toBeNull();
  });

  it("uses asset dimensions to size the container when no cms ratio is set", () => {
    const { container } = render(
      <Video src="/banner.mp4" mediaWidth={1920} mediaHeight={200} controls={false} />,
    );
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.style.objectFit).toBe("cover");
  });

  it("renders the native controls when controls are enabled", () => {
    render(<Video src="/clip.mp4" />);
    expect(screen.getByLabelText("Seek")).toBeInTheDocument();
  });

  it("marks the video as loaded when it already has data on mount", () => {
    const readyState = vi
      .spyOn(window.HTMLMediaElement.prototype, "readyState", "get")
      .mockReturnValue(4);

    const { container } = render(<Video src="/clip.mp4" controls={false} />);
    expect(container.querySelector("video")).toHaveStyle({ opacity: "1" });

    readyState.mockRestore();
  });

  it("exposes the underlying media element through mediaRef", () => {
    const mediaRef = createRef<HTMLVideoElement>();

    const { container } = render(<Video src="/clip.mp4" controls={false} mediaRef={mediaRef} />);

    expect(mediaRef.current).toBe(container.querySelector("video"));
  });

  it("keeps its own controls working when mediaRef is passed", () => {
    const mediaRef = createRef<HTMLVideoElement>();

    render(<Video src="/clip.mp4" mediaRef={mediaRef} />);

    expect(screen.getByLabelText("Seek")).toBeInTheDocument();
  });

  it("does not leak mediaRef onto the video element", () => {
    const mediaRef = createRef<HTMLVideoElement>();

    const { container } = render(<Video src="/clip.mp4" controls={false} mediaRef={mediaRef} />);

    expect(container.querySelector("video")).not.toHaveAttribute("mediaRef");
  });

  describe("youtube", () => {
    it("embeds a watch url by its video id", () => {
      const { container } = render(
        <Video src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" source="youtube" />,
      );
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/embed/dQw4w9WgXcQ"),
      );
    });

    it("accepts a bare 11-character id", () => {
      const { container } = render(<Video src="dQw4w9WgXcQ" source="youtube" />);
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/embed/dQw4w9WgXcQ"),
      );
    });

    it("embeds a youtu.be short url", () => {
      const { container } = render(<Video src="https://youtu.be/dQw4w9WgXcQ" source="youtube" />);
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/embed/dQw4w9WgXcQ"),
      );
    });

    it("passes unparseable urls through untouched", () => {
      const { container } = render(<Video src="not-a-youtube-url" source="youtube" />);
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/embed/not-a-youtube-url"),
      );
    });

    it("encodes the playback flags in the embed params", () => {
      const { container } = render(
        <Video src="dQw4w9WgXcQ" source="youtube" autoPlay loop muted controls={false} />,
      );
      const src = container.querySelector("iframe")?.getAttribute("src") ?? "";
      expect(src).toContain("autoplay=1");
      expect(src).toContain("loop=1");
      expect(src).toContain("mute=1");
      expect(src).toContain("controls=0");
    });

    it("reveals the iframe once it has loaded", () => {
      const { container } = render(<Video src="dQw4w9WgXcQ" source="youtube" />);
      const iframe = container.querySelector("iframe") as HTMLIFrameElement;
      expect(iframe).toHaveStyle({ opacity: "0" });
      fireEvent.load(iframe);
      expect(iframe).toHaveStyle({ opacity: "1" });
    });
  });

  describe("vimeo", () => {
    it("embeds a vimeo url by its numeric id", () => {
      const { container } = render(<Video src="https://vimeo.com/123456789" source="vimeo" />);
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/video/123456789"),
      );
    });

    it("accepts a bare numeric id", () => {
      const { container } = render(<Video src="987654321" source="vimeo" />);
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/video/987654321"),
      );
    });

    it("accepts the /video/ url form", () => {
      const { container } = render(
        <Video src="https://vimeo.com/video/555000111" source="vimeo" />,
      );
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/video/555000111"),
      );
    });

    it("passes unparseable urls through untouched", () => {
      const { container } = render(<Video src="not-a-vimeo-url" source="vimeo" />);
      expect(container.querySelector("iframe")).toHaveAttribute(
        "src",
        expect.stringContaining("/video/not-a-vimeo-url"),
      );
    });

    it("encodes the playback flags in the embed params", () => {
      const { container } = render(
        <Video src="123456789" source="vimeo" autoPlay loop muted controls={false} />,
      );
      const src = container.querySelector("iframe")?.getAttribute("src") ?? "";
      expect(src).toContain("autoplay=1");
      expect(src).toContain("loop=1");
      expect(src).toContain("muted=1");
      expect(src).toContain("controls=0");
    });
  });

  describe("copyright", () => {
    it("renders an inline label over the video", () => {
      render(<Video src="/clip.mp4" controls={false} copyright="© httpjpg" />);
      expect(screen.getByText(/httpjpg/)).toBeInTheDocument();
    });

    it("renders an overlay label", () => {
      render(
        <Video
          src="/clip.mp4"
          controls={false}
          copyright="© httpjpg"
          copyrightPosition="overlay"
        />,
      );
      expect(screen.getByText(/httpjpg/)).toBeInTheDocument();
    });

    it("renders the label below the video", () => {
      render(
        <Video src="/clip.mp4" controls={false} copyright="© httpjpg" copyrightPosition="below" />,
      );
      expect(screen.getByText(/httpjpg/)).toBeInTheDocument();
    });

    it("renders no label without a copyright text", () => {
      render(<Video src="/clip.mp4" controls={false} copyrightPosition="below" />);
      expect(screen.queryByText(/httpjpg/)).not.toBeInTheDocument();
    });

    it("renders a source line without a copyright text", () => {
      render(
        <Video
          src="/clip.mp4"
          controls={false}
          copyrightSource="film archive"
          copyrightPosition="below"
        />,
      );
      expect(screen.getByText(/film archive/)).toBeInTheDocument();
    });
  });

  it("reloads when the native src changes", () => {
    const load = vi.spyOn(window.HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    const { rerender } = render(<Video src="/one.mp4" controls={false} />);
    load.mockClear();
    rerender(<Video src="/two.mp4" controls={false} />);
    expect(load).toHaveBeenCalled();
    load.mockRestore();
  });

  it("skips autoplay when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);
    const play = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    render(<Video src="/clip.mp4" autoPlay muted controls={false} />);
    expect(play).not.toHaveBeenCalled();
    play.mockRestore();
    mockReducedMotion.mockReturnValue(false);
  });
});
