import { render, screen } from "@testing-library/react";

import { MP3Player } from "./mp3-player";

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
});
