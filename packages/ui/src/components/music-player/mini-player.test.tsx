import { fireEvent, render, screen } from "@testing-library/react";

import { MiniPlayer } from "./mini-player";

function renderPlayer(props: Partial<Parameters<typeof MiniPlayer>[0]> = {}) {
  const handlers = { onToggle: vi.fn(), onNext: vi.fn(), onPrevious: vi.fn() };
  render(
    <MiniPlayer
      title="Night Drive"
      artist="Nova"
      isPlaying={false}
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
        hasNext
        hasPrevious
        onToggle={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Pause" })).toHaveTextContent("▮▮");
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
});
