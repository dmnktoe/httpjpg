import { act, fireEvent, render, screen } from "@testing-library/react";

vi.mock("@httpjpg/analytics", () => ({
  trackAudioPause: vi.fn(),
  trackAudioPlay: vi.fn(),
  trackAudioSkip: vi.fn(),
  trackLightboxClose: vi.fn(),
  trackLightboxNavigate: vi.fn(),
  trackLightboxOpen: vi.fn(),
}));

import {
  trackAudioPause,
  trackAudioPlay,
  trackAudioSkip,
  trackLightboxClose,
  trackLightboxNavigate,
  trackLightboxOpen,
} from "@httpjpg/analytics";
import {
  LightboxTrigger,
  useAudioPlayer,
  useAudioQueueEntry,
  useLightboxEntry,
  useLightboxGallery,
  type AudioTrack,
  type LightboxEntry,
} from "@httpjpg/ui";

import { TrackedAudioPlayerProvider, TrackedLightboxProvider } from "./tracked-media-providers";

const ITEM: LightboxEntry = { id: "one", src: "/one.jpg", alt: "One" };
const NEXT_ITEM: LightboxEntry = { id: "two", src: "/two.jpg", alt: "Two", video: {} };
const TRACK: AudioTrack = { src: "/one.mp3", title: "One", href: "/work/one" };
const NEXT_TRACK: AudioTrack = { src: "/two.mp3", title: "Two", href: "/work/two" };

function Thumb({ item }: { item: LightboxEntry }) {
  const gallery = useLightboxGallery();
  useLightboxEntry(item);

  return (
    <div style={{ position: "relative" }}>
      <img src={item.src} alt={item.alt} />
      <LightboxTrigger
        label={`Open ${item.alt} at full size`}
        onClick={() => gallery?.openAt(item.id)}
      />
    </div>
  );
}

function PlayButton({ track }: { track: AudioTrack }) {
  const player = useAudioPlayer();
  useAudioQueueEntry(track);

  return (
    <>
      <button type="button" onClick={() => player?.play(track)}>
        play {track.src}
      </button>
      <button type="button" onClick={player?.next}>
        next
      </button>
    </>
  );
}

describe("tracked media providers", () => {
  it("fans lightbox open, navigate, and close out through analytics", () => {
    render(
      <TrackedLightboxProvider>
        <Thumb item={ITEM} />
        <Thumb item={NEXT_ITEM} />
      </TrackedLightboxProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open One at full size" }));
    expect(trackLightboxOpen).toHaveBeenCalledWith({ type: "image", index: 0, count: 2 });

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(trackLightboxNavigate).toHaveBeenCalledWith({ type: "video", index: 1, count: 2 });

    fireEvent.click(screen.getByRole("button", { name: "Close image viewer" }));
    expect(trackLightboxClose).toHaveBeenCalledWith({ type: "video", index: 1 });
  });

  it("fans audio play, pause, and skip out through analytics", () => {
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(async () => {});
    vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

    render(
      <TrackedAudioPlayerProvider>
        <PlayButton track={TRACK} />
        <PlayButton track={NEXT_TRACK} />
      </TrackedAudioPlayerProvider>,
    );

    fireEvent.click(screen.getByText("play /one.mp3"));
    const audio = document.querySelector("audio");
    expect(audio).toBeTruthy();
    act(() => {
      audio?.dispatchEvent(new Event("play"));
    });
    expect(trackAudioPlay).toHaveBeenCalledWith({ title: "One", href: "/work/one" });

    act(() => {
      audio?.dispatchEvent(new Event("pause"));
    });
    expect(trackAudioPause).toHaveBeenCalledWith({ title: "One", href: "/work/one" });

    fireEvent.click(screen.getAllByText("next")[0]!);
    expect(trackAudioSkip).toHaveBeenCalledWith({
      direction: "next",
      title: "Two",
      href: "/work/two",
    });
  });
});
