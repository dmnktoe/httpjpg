import { render, screen } from "@testing-library/react";

import { NowPlaying } from "./now-playing";

// Keep colour extraction deterministic and synchronous-free.
vi.mock("@httpjpg/spotify", () => ({
  extractVibrantColor: vi.fn().mockResolvedValue(null),
}));

describe("NowPlaying", () => {
  it("renders the track title and artist", () => {
    render(<NowPlaying title="My Song" artist="The Band" autoExtractColor={false} />);
    expect(screen.getByText("My Song")).toBeInTheDocument();
    expect(screen.getByText("The Band")).toBeInTheDocument();
  });

  it("renders the artwork image when artwork is provided", () => {
    render(
      <NowPlaying
        title="Track"
        artist="Artist"
        artwork="https://img.test/a.jpg"
        vibrantColor="rgba(1, 2, 3, 0.9)"
        autoExtractColor={false}
      />,
    );
    expect(screen.getByAltText("Track artwork")).toBeInTheDocument();
  });

  it("renders the loading skeleton without an image", () => {
    render(<NowPlaying isLoading autoExtractColor={false} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders the playing sparkles when isPlaying is true", () => {
    render(<NowPlaying title="t" artist="a" isPlaying autoExtractColor={false} />);
    expect(screen.getByText("✮")).toBeInTheDocument();
  });

  it("supports the lg size variant", () => {
    const { container } = render(
      <NowPlaying title="t" artist="a" size="lg" autoExtractColor={false} />,
    );
    expect(container.querySelector('[data-draggable="true"]')).not.toBeNull();
  });
});
