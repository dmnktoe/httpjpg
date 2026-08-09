import { fireEvent, render, screen } from "@testing-library/react";

import { MiniPlayer } from "./mini-player";

function renderPlayer(props: Partial<Parameters<typeof MiniPlayer>[0]> = {}) {
  const handlers = { onToggle: vi.fn(), onNext: vi.fn(), onPrevious: vi.fn() };
  render(
    <MiniPlayer
      title="Night Drive"
      artist="Nova"
      isPlaying={false}
      currentTime={0}
      duration={0}
      hasNext={false}
      hasPrevious={false}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("MiniPlayer", () => {
  it("names the group after the track", () => {
    renderPlayer();

    expect(screen.getByRole("group", { name: "Now playing: Night Drive — Nova" })).toBeVisible();
  });

  it("falls back to a generic label without metadata", () => {
    renderPlayer({ title: undefined, artist: undefined });

    expect(screen.getByRole("group", { name: "Now playing: audio" })).toBeInTheDocument();
  });

  it("shows the play control while paused and the pause control while playing", () => {
    const { rerender } = render(
      <MiniPlayer
        isPlaying={false}
        currentTime={0}
        duration={0}
        hasNext
        hasPrevious
        onToggle={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Play" })).toHaveTextContent("▸");

    rerender(
      <MiniPlayer
        isPlaying
        currentTime={0}
        duration={0}
        hasNext
        hasPrevious
        onToggle={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("calls back for every transport control", () => {
    const handlers = renderPlayer({ hasNext: true, hasPrevious: true });

    fireEvent.click(screen.getByRole("button", { name: "Previous track" }));
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    fireEvent.click(screen.getByRole("button", { name: "Next track" }));

    expect(handlers.onPrevious).toHaveBeenCalledOnce();
    expect(handlers.onToggle).toHaveBeenCalledOnce();
    expect(handlers.onNext).toHaveBeenCalledOnce();
  });

  it("disables the ends of the queue", () => {
    renderPlayer();

    expect(screen.getByRole("button", { name: "Previous track" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next track" })).toBeDisabled();
  });

  it("spins the artwork when there is one", () => {
    const { container } = render(
      <MiniPlayer
        title="Night Drive"
        artwork="/art.jpg"
        isPlaying
        currentTime={0}
        duration={0}
        hasNext={false}
        hasPrevious={false}
        onToggle={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "/art.jpg");
  });

  it("falls back to a record glyph without artwork", () => {
    renderPlayer();

    expect(screen.getByText("◉")).toBeInTheDocument();
  });

  it("waits for the metadata before showing a clock", () => {
    renderPlayer();

    expect(screen.getByText("-:--")).toBeInTheDocument();
  });

  it("counts the elapsed time once the length is known", () => {
    renderPlayer({ currentTime: 65, duration: 185 });

    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.queryByText("-:--")).not.toBeInTheDocument();
  });

  it("points the record at the source url", () => {
    renderPlayer({ href: "/audio/night-drive.mp3" });

    const link = screen.getByRole("link", { name: "Open the source of Night Drive — Nova" });
    expect(link).toHaveAttribute("href", "/audio/night-drive.mp3");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("leaves the record unlinked without a source url", () => {
    renderPlayer();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
