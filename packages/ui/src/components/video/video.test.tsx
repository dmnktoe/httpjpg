import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Video } from "./video";

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
});
