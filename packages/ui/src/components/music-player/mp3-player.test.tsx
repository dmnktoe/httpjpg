import { act, fireEvent, render, screen } from "@testing-library/react";

import { MP3Player } from "./mp3-player";

// jsdom implements neither playback nor a writable currentTime; stub both so
// the component's play/pause and seek paths are observable.
function stubAudio({ playRejects = false } = {}) {
  const play = vi
    .spyOn(window.HTMLMediaElement.prototype, "play")
    .mockImplementation(playRejects ? () => Promise.reject(new Error("blocked")) : async () => {});
  const pause = vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  return { play, pause };
}

function audioElement(container: HTMLElement) {
  const audio = container.querySelector("audio") as HTMLAudioElement;
  Object.defineProperty(audio, "currentTime", { value: 0, writable: true, configurable: true });
  return audio;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MP3Player", () => {
  it("gives the audio element a default accessible name", () => {
    const { container } = render(<MP3Player src="/track.mp3" />);
    expect(container.querySelector("audio")).toHaveAttribute("aria-label", "Audio player");
  });

  it("uses the track title as the audio accessible name when provided", () => {
    const { container } = render(<MP3Player src="/track.mp3" title="Night Drive" />);
    expect(container.querySelector("audio")).toHaveAttribute("aria-label", "Night Drive");
  });

  it("labels the seek slider", () => {
    render(<MP3Player src="/track.mp3" />);
    expect(screen.getByRole("slider", { name: /seek/i })).toBeInTheDocument();
  });

  it("hides the metadata row when neither artwork nor info is requested", () => {
    render(<MP3Player src="/track.mp3" title="Night Drive" artist="Nova" artwork="/art.jpg" />);

    expect(screen.queryByText("Night Drive")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Night Drive")).not.toBeInTheDocument();
  });

  it("renders the artwork when asked to", () => {
    render(<MP3Player src="/track.mp3" title="Night Drive" artwork="/art.jpg" showArtwork />);

    expect(screen.getByAltText("Night Drive")).toHaveAttribute("src", "/art.jpg");
  });

  it("falls back to a generic artwork alt text", () => {
    render(<MP3Player src="/track.mp3" artwork="/art.jpg" showArtwork />);

    expect(screen.getByAltText("Album artwork")).toBeInTheDocument();
  });

  it("skips the artwork slot when there is no artwork url", () => {
    render(<MP3Player src="/track.mp3" title="Night Drive" showArtwork />);

    expect(screen.queryByAltText("Night Drive")).not.toBeInTheDocument();
  });

  it("renders the title and the artist", () => {
    render(<MP3Player src="/track.mp3" title="Night Drive" artist="Nova" showInfo />);

    expect(screen.getByText("Night Drive")).toBeInTheDocument();
    expect(screen.getByText("Nova")).toBeInTheDocument();
  });

  it("renders the artist alone when there is no title", () => {
    render(<MP3Player src="/track.mp3" artist="Nova" showInfo />);

    expect(screen.getByText("Nova")).toBeInTheDocument();
  });

  it("renders no info block when there is neither title nor artist", () => {
    const { container } = render(<MP3Player src="/track.mp3" showInfo />);

    expect(container.querySelector("audio")).toHaveAttribute("aria-label", "Audio player");
  });

  it("plays the track and flips the button on the play event", () => {
    const { play } = stubAudio();
    const { container } = render(<MP3Player src="/track.mp3" />);
    const audio = audioElement(container);

    fireEvent.click(screen.getByLabelText("Play"));
    expect(play).toHaveBeenCalledOnce();

    act(() => {
      Object.defineProperty(audio, "paused", { value: false, configurable: true });
      audio.dispatchEvent(new Event("play"));
    });
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("PAUSE");
  });

  it("pauses a playing track", () => {
    const { pause } = stubAudio();
    const { container } = render(<MP3Player src="/track.mp3" />);
    const audio = audioElement(container);

    Object.defineProperty(audio, "paused", { value: false, configurable: true });
    act(() => {
      audio.dispatchEvent(new Event("play"));
    });

    fireEvent.click(screen.getByLabelText("Pause"));
    expect(pause).toHaveBeenCalledOnce();

    act(() => {
      Object.defineProperty(audio, "paused", { value: true, configurable: true });
      audio.dispatchEvent(new Event("pause"));
    });
    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("stays on the play label when the browser blocks playback", async () => {
    stubAudio({ playRejects: true });
    render(<MP3Player src="/track.mp3" />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Play"));
    });

    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("returns to the play label when the track ends", () => {
    stubAudio();
    const { container } = render(<MP3Player src="/track.mp3" />);
    const audio = audioElement(container);

    Object.defineProperty(audio, "paused", { value: false, configurable: true });
    act(() => {
      audio.dispatchEvent(new Event("play"));
    });

    act(() => {
      Object.defineProperty(audio, "paused", { value: true, configurable: true });
      audio.dispatchEvent(new Event("ended"));
    });

    expect(screen.getByLabelText("Play")).toBeInTheDocument();
  });

  it("tracks the duration and the current time", () => {
    const { container } = render(<MP3Player src="/track.mp3" />);
    const audio = audioElement(container);

    Object.defineProperty(audio, "duration", { value: 185, configurable: true });
    audio.currentTime = 65;
    act(() => {
      audio.dispatchEvent(new Event("loadedmetadata"));
      audio.dispatchEvent(new Event("timeupdate"));
    });

    expect(screen.getByText("1:05 / 3:05")).toBeInTheDocument();
  });

  it("seeks the track", () => {
    const { container } = render(<MP3Player src="/track.mp3" />);
    const audio = audioElement(container);

    Object.defineProperty(audio, "duration", { value: 120, configurable: true });
    act(() => {
      audio.dispatchEvent(new Event("loadedmetadata"));
    });
    fireEvent.change(screen.getByLabelText("Seek"), { target: { value: "30" } });

    expect(audio.currentTime).toBe(30);
    expect(screen.getByText("0:30 / 2:00")).toBeInTheDocument();
  });

  it("changes the volume and shows it as a percentage", () => {
    const { container } = render(<MP3Player src="/track.mp3" />);
    const audio = audioElement(container);

    fireEvent.change(screen.getByLabelText("Volume"), { target: { value: "0.4" } });

    expect(audio.volume).toBeCloseTo(0.4);
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("detaches its audio listeners on unmount", () => {
    const { container, unmount } = render(<MP3Player src="/track.mp3" />);
    const audio = container.querySelector("audio") as HTMLAudioElement;
    const removeEventListener = vi.spyOn(audio, "removeEventListener");

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("ended", expect.any(Function));
  });
});
