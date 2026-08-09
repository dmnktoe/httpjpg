import { fireEvent, render, screen } from "@testing-library/react";

import { AudioTrackRow } from "./audio-track-row";

const BASE = {
  title: "Night Drive",
  artist: "Nova",
  isActive: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  onToggle: vi.fn(),
  onSeek: vi.fn(),
};

describe("AudioTrackRow", () => {
  it("renders the metadata", () => {
    render(<AudioTrackRow {...BASE} artwork="/art.jpg" />);

    expect(screen.getByText("Night Drive")).toBeInTheDocument();
    expect(screen.getByText("Nova")).toBeInTheDocument();
    expect(screen.getByAltText("Night Drive")).toHaveAttribute("src", "/art.jpg");
  });

  it("hides artwork and info when they are switched off", () => {
    render(<AudioTrackRow {...BASE} artwork="/art.jpg" showArtwork={false} showInfo={false} />);

    expect(screen.queryByAltText("Night Drive")).not.toBeInTheDocument();
    expect(screen.queryByText("Nova")).not.toBeInTheDocument();
  });

  it("falls back to a generic artwork alt text", () => {
    render(<AudioTrackRow {...BASE} title={undefined} artwork="/art.jpg" />);

    expect(screen.getByAltText("Album artwork")).toBeInTheDocument();
  });

  it("offers play until it owns the player", () => {
    const onToggle = vi.fn();
    const { rerender } = render(<AudioTrackRow {...BASE} onToggle={onToggle} />);

    expect(screen.getByRole("button", { name: "Play" })).toHaveTextContent("▸ PLAY");
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<AudioTrackRow {...BASE} onToggle={onToggle} isActive isPlaying />);
    expect(screen.getByRole("button", { name: "Pause" })).toHaveTextContent("∥ PAUSE");
  });

  it("stays on play while another track holds the player", () => {
    render(<AudioTrackRow {...BASE} isPlaying />);

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("shows progress only for the active track", () => {
    const { rerender } = render(<AudioTrackRow {...BASE} />);

    expect(screen.queryByLabelText("Seek")).not.toBeInTheDocument();

    rerender(<AudioTrackRow {...BASE} isActive currentTime={65} duration={185} />);

    expect(screen.getByText("1:05 / 3:05")).toBeInTheDocument();
  });

  it("seeks through the slider", () => {
    const onSeek = vi.fn();
    render(<AudioTrackRow {...BASE} isActive duration={120} onSeek={onSeek} />);

    fireEvent.change(screen.getByLabelText("Seek"), { target: { value: "30" } });

    expect(onSeek).toHaveBeenCalledWith(30);
  });
});
