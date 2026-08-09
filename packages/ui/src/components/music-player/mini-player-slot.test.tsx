import { fireEvent, render, screen } from "@testing-library/react";

import { useAudioPlayer } from "./audio-player-context";
import { AudioPlayerProvider } from "./audio-player-provider";
import { MiniPlayerSlot } from "./mini-player-slot";

function PlayTrigger() {
  const player = useAudioPlayer();
  return (
    <button type="button" onClick={() => player?.play({ src: "/one.mp3", title: "One" })}>
      start
    </button>
  );
}

beforeEach(() => {
  vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(async () => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MiniPlayerSlot", () => {
  it("renders nothing outside a provider", () => {
    const { container } = render(<MiniPlayerSlot />);

    expect(container).toBeEmptyDOMElement();
  });

  it("stays out of the header until something is loaded", () => {
    render(
      <AudioPlayerProvider>
        <MiniPlayerSlot />
        <PlayTrigger />
      </AudioPlayerProvider>,
    );

    expect(screen.queryByRole("group")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("start"));

    expect(screen.getByRole("group", { name: "Now playing: One" })).toBeInTheDocument();
  });

  it("drives the shared player from the header", () => {
    const pause = vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    render(
      <AudioPlayerProvider>
        <MiniPlayerSlot />
        <PlayTrigger />
      </AudioPlayerProvider>,
    );
    fireEvent.click(screen.getByText("start"));

    const audio = document.querySelector("audio") as HTMLAudioElement;
    Object.defineProperty(audio, "paused", { value: false, configurable: true });
    fireEvent(audio, new Event("play"));

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));

    expect(pause).toHaveBeenCalledOnce();
  });
});
