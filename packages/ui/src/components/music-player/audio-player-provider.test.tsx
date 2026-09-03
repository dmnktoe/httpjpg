import { act, fireEvent, render, screen } from "@testing-library/react";

import type { AudioTrack } from "./audio-player-context";
import { useAudioPlayer, useAudioQueueEntry } from "./audio-player-context";
import { AudioPlayerProvider } from "./audio-player-provider";

const FIRST: AudioTrack = { src: "/one.mp3", title: "One", artist: "Nova" };
const SECOND: AudioTrack = { src: "/two.mp3", title: "Two" };

function QueueEntry({ track }: { track: AudioTrack }) {
  const player = useAudioPlayer();
  useAudioQueueEntry(track);

  return (
    <button type="button" onClick={() => player?.play(track)}>
      play {track.src}
    </button>
  );
}

function Transport() {
  const player = useAudioPlayer();
  if (!player) {
    return null;
  }

  return (
    <>
      <span data-testid="current">{player.track?.src ?? "none"}</span>
      <span data-testid="page">{player.track?.href ?? "none"}</span>
      <span data-testid="playing">{String(player.isPlaying)}</span>
      <span data-testid="has-next">{String(player.hasNext)}</span>
      <span data-testid="has-previous">{String(player.hasPrevious)}</span>
      <span data-testid="time">{`${player.currentTime}/${player.duration}`}</span>
      <button type="button" onClick={player.next}>
        next
      </button>
      <button type="button" onClick={player.previous}>
        previous
      </button>
      <button type="button" onClick={player.toggle}>
        toggle
      </button>
      <button type="button" onClick={() => player.seek(42)}>
        seek
      </button>
      <button type="button" onClick={player.stop}>
        stop
      </button>
    </>
  );
}

function stubPlayback() {
  const play = vi
    .spyOn(window.HTMLMediaElement.prototype, "play")
    .mockImplementation(async () => {});
  const pause = vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  return { play, pause };
}

function audioElement(): HTMLAudioElement {
  const audio = document.querySelector("audio") as HTMLAudioElement;
  // jsdom's currentTime is read-only; make it writable once, not on every look-up.
  if (!Object.getOwnPropertyDescriptor(audio, "currentTime")) {
    Object.defineProperty(audio, "currentTime", { value: 0, writable: true, configurable: true });
  }
  return audio;
}

function emit(event: string, isPaused?: boolean) {
  const audio = audioElement();
  if (isPaused !== undefined) {
    Object.defineProperty(audio, "paused", { value: isPaused, configurable: true });
  }
  act(() => {
    audio.dispatchEvent(new Event(event));
  });
}

function renderQueue(tracks: AudioTrack[] = [FIRST, SECOND]) {
  const result = render(
    <AudioPlayerProvider>
      {tracks.map((track, index) => (
        <QueueEntry key={`${track.src}-${index}`} track={track} />
      ))}
      <Transport />
    </AudioPlayerProvider>,
  );
  audioElement();
  return result;
}

function state(id: string) {
  return screen.getByTestId(id).textContent;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AudioPlayerProvider", () => {
  it("starts a track and points the shared element at it", () => {
    const { play } = stubPlayback();
    renderQueue();

    fireEvent.click(screen.getByText("play /one.mp3"));

    expect(play).toHaveBeenCalledOnce();
    expect(state("current")).toBe("/one.mp3");
    expect(audioElement().getAttribute("src")).toBe("/one.mp3");
  });

  it("reflects playback state from the element's own events", () => {
    stubPlayback();
    renderQueue();

    fireEvent.click(screen.getByText("play /one.mp3"));
    expect(state("playing")).toBe("false");

    emit("play", false);
    expect(state("playing")).toBe("true");

    emit("pause", true);
    expect(state("playing")).toBe("false");
  });

  it("queues every track mounted on the page", () => {
    stubPlayback();
    renderQueue();

    fireEvent.click(screen.getByText("play /one.mp3"));

    expect(state("has-next")).toBe("true");
    expect(state("has-previous")).toBe("false");
  });

  it("walks the queue forwards and back", () => {
    stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));

    fireEvent.click(screen.getByText("next"));
    expect(state("current")).toBe("/two.mp3");
    expect(state("has-next")).toBe("false");
    expect(state("has-previous")).toBe("true");

    fireEvent.click(screen.getByText("previous"));
    expect(state("current")).toBe("/one.mp3");
  });

  it("keeps the queue after the blok that started it unmounts", () => {
    stubPlayback();
    const { rerender } = renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));

    // What a client-side navigation does: the page's players go away while the
    // provider in the root layout stays mounted.
    rerender(
      <AudioPlayerProvider>
        <Transport />
      </AudioPlayerProvider>,
    );

    fireEvent.click(screen.getByText("next"));
    expect(state("current")).toBe("/two.mp3");
  });

  it("advances to the next track when one ends", () => {
    stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));

    emit("ended");

    expect(state("current")).toBe("/two.mp3");
  });

  it("comes to rest at the end of the queue", () => {
    stubPlayback();
    renderQueue([FIRST]);
    fireEvent.click(screen.getByText("play /one.mp3"));
    emit("play", false);

    emit("ended");

    expect(state("playing")).toBe("false");
    expect(state("current")).toBe("/one.mp3");
  });

  it("pauses and resumes the running track", () => {
    const { play, pause } = stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));
    emit("play", false);

    fireEvent.click(screen.getByText("toggle"));
    expect(pause).toHaveBeenCalledOnce();

    emit("pause", true);
    fireEvent.click(screen.getByText("toggle"));
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("ignores the transport while nothing is loaded", () => {
    const { play } = stubPlayback();
    renderQueue();

    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("next"));

    expect(play).not.toHaveBeenCalled();
    expect(state("current")).toBe("none");
  });

  it("seeks the element and reports the new position", () => {
    stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));

    fireEvent.click(screen.getByText("seek"));

    expect(audioElement().currentTime).toBe(42);
    expect(state("time")).toBe("42/0");
  });

  it("picks the duration up from the metadata", () => {
    stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));

    const audio = audioElement();
    Object.defineProperty(audio, "duration", { value: 185, configurable: true });
    emit("loadedmetadata");
    audio.currentTime = 65;
    emit("timeupdate");

    expect(state("time")).toBe("65/185");
  });

  it("stays on the loaded track when the same one is played again", () => {
    const { play } = stubPlayback();
    renderQueue();

    fireEvent.click(screen.getByText("play /one.mp3"));
    const audio = audioElement();
    audio.currentTime = 30;
    emit("timeupdate");
    fireEvent.click(screen.getByText("play /one.mp3"));

    expect(play).toHaveBeenCalledTimes(2);
    expect(state("time")).toBe("30/0");
  });

  it("stamps a track with the page it was registered from", () => {
    stubPlayback();
    window.history.pushState({}, "", "/work/night-drive");
    renderQueue();

    fireEvent.click(screen.getByText("play /one.mp3"));

    expect(state("page")).toBe("/work/night-drive");
    window.history.pushState({}, "", "/");
  });

  it("unloads the track and empties the queue on stop", () => {
    stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));
    emit("play", false);

    fireEvent.click(screen.getByText("stop"));

    expect(state("current")).toBe("none");
    expect(state("playing")).toBe("false");
    expect(state("has-next")).toBe("false");
    expect(audioElement().hasAttribute("src")).toBe(false);
  });

  it("takes a fresh track after a stop", () => {
    stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));
    fireEvent.click(screen.getByText("stop"));

    fireEvent.click(screen.getByText("play /two.mp3"));

    expect(state("current")).toBe("/two.mp3");
    expect(audioElement().getAttribute("src")).toBe("/two.mp3");
  });

  it("names the shared element after the loaded track", () => {
    stubPlayback();
    renderQueue();
    expect(audioElement()).toHaveAttribute("aria-label", "Audio player");

    fireEvent.click(screen.getByText("play /one.mp3"));

    expect(audioElement()).toHaveAttribute("aria-label", "One");
  });

  it("plays a track that was never registered on the page", () => {
    stubPlayback();
    function Ghost() {
      const player = useAudioPlayer();
      return (
        <button type="button" onClick={() => player?.play({ src: "/ghost.mp3", title: "Ghost" })}>
          ghost
        </button>
      );
    }
    render(
      <AudioPlayerProvider>
        <Ghost />
        <Transport />
      </AudioPlayerProvider>,
    );
    fireEvent.click(screen.getByText("ghost"));
    expect(state("current")).toBe("/ghost.mp3");
  });

  it("keeps the first registration when the same src mounts twice", () => {
    stubPlayback();
    const duplicate: AudioTrack = { src: FIRST.src, title: "One-again", artist: "Other" };
    renderQueue([FIRST, duplicate]);
    fireEvent.click(screen.getAllByText("play /one.mp3")[1]!);
    expect(state("current")).toBe("/one.mp3");
    expect(audioElement()).toHaveAttribute("aria-label", "One");
  });

  it("treats a blocked play() as still paused and a NaN duration as zero", () => {
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockRejectedValue(new Error("blocked"));
    vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));
    expect(state("playing")).toBe("false");

    const audio = audioElement();
    Object.defineProperty(audio, "duration", { value: Number.NaN, configurable: true });
    emit("loadedmetadata");
    expect(state("time")).toBe("0/0");
  });

  it("keeps an explicit href and falls back to untitled without a title", () => {
    stubPlayback();
    render(
      <AudioPlayerProvider>
        <QueueEntry track={{ src: "/one.mp3", title: "", href: "/custom", artwork: "/art.jpg" }} />
        <Transport />
      </AudioPlayerProvider>,
    );
    fireEvent.click(screen.getByText("play /one.mp3"));
    expect(state("page")).toBe("/custom");
    expect(audioElement()).toHaveAttribute("aria-label", "Audio player");
  });
});

describe("AudioPlayerProvider media session", () => {
  const setActionHandler = vi.fn();
  const session = { setActionHandler, metadata: null, playbackState: "none" };

  beforeEach(() => {
    Object.defineProperty(navigator, "mediaSession", { value: session, configurable: true });
    vi.stubGlobal(
      "MediaMetadata",
      class {
        constructor(public init: Record<string, unknown>) {}
      },
    );
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "mediaSession");
    vi.unstubAllGlobals();
    setActionHandler.mockClear();
  });

  it("registers the lock-screen transport controls", () => {
    stubPlayback();
    renderQueue();

    expect(setActionHandler.mock.calls.map(([action]) => action)).toEqual([
      "play",
      "pause",
      "previoustrack",
      "nexttrack",
    ]);
  });

  it("publishes the loaded track and the playback state", () => {
    stubPlayback();
    renderQueue();

    fireEvent.click(screen.getByText("play /one.mp3"));
    emit("play", false);

    expect(session.metadata).toMatchObject({
      init: { title: "One", artist: "Nova", artwork: undefined },
    });
    expect(session.playbackState).toBe("playing");
  });

  it("falls back to untitled and includes artwork when present", () => {
    stubPlayback();
    render(
      <AudioPlayerProvider>
        <QueueEntry track={{ src: "/one.mp3", title: "", artwork: "/art.jpg" }} />
        <Transport />
      </AudioPlayerProvider>,
    );
    fireEvent.click(screen.getByText("play /one.mp3"));
    expect(session.metadata).toMatchObject({
      init: { title: "untitled", artwork: [{ src: "/art.jpg" }] },
    });
  });

  it("skips metadata when MediaMetadata is missing", () => {
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, "mediaSession", { value: session, configurable: true });
    stubPlayback();
    renderQueue();
    fireEvent.click(screen.getByText("play /one.mp3"));
    expect(session.playbackState).toBe("paused");
  });
});
