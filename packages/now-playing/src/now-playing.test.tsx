import { render, screen, waitFor } from "@testing-library/react";

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

  it("applies the extracted vibrant color when auto extraction is enabled", async () => {
    const { extractVibrantColor } = await import("@httpjpg/spotify");
    vi.mocked(extractVibrantColor).mockResolvedValueOnce({
      rgb: "rgb(10, 20, 30)",
      rgba: "rgba(10, 20, 30, 0.9)",
      textColor: "black",
    });

    const { container } = render(
      <NowPlaying title="t" artist="a" artwork="https://img.test/vibrant.jpg" autoExtractColor />,
    );

    expect(extractVibrantColor).toHaveBeenCalledWith("https://img.test/vibrant.jpg");
    await waitFor(() => {
      expect(container.innerHTML).toContain("rgba(10, 20, 30, 0.9)");
    });
  });
});
