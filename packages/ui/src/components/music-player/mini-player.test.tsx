import { act, fireEvent, render, screen } from "@testing-library/react";

import { MiniPlayer } from "./mini-player";

function renderPlayer(props: Partial<Parameters<typeof MiniPlayer>[0]> = {}) {
  const handlers = { onToggle: vi.fn(), onNext: vi.fn(), onPrevious: vi.fn(), onStop: vi.fn() };
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
        onStop={vi.fn()}
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
        onStop={vi.fn()}
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
        onStop={vi.fn()}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "/art.jpg");
  });

  it("stops the record once playback stops", () => {
    const { rerender } = render(
      <MiniPlayer
        title="Night Drive"
        isPlaying
        currentTime={0}
        duration={0}
        hasNext={false}
        hasPrevious={false}
        onToggle={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        onStop={vi.fn()}
      />,
    );

    const record = screen.getByText("◉").parentElement;
    expect(record).toHaveClass("anim-ps_running");

    rerender(
      <MiniPlayer
        title="Night Drive"
        isPlaying={false}
        currentTime={0}
        duration={0}
        hasNext={false}
        hasPrevious={false}
        onToggle={vi.fn()}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
        onStop={vi.fn()}
      />,
    );

    expect(record).toHaveClass("anim-ps_paused");
    const shorthands = (record?.className ?? "")
      .split(" ")
      .filter((name) => /(?:^|:)anim_/.test(name) && !name.startsWith("motionReduce:"));
    expect(shorthands).toEqual([]);
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

  it("points the record back at the page the track sits on", () => {
    renderPlayer({ href: "/work/night-drive" });

    const link = screen.getByRole("link", { name: "Go to the page playing Night Drive — Nova" });
    expect(link).toHaveAttribute("href", "/work/night-drive");
    // An internal route, so it must not carry the new-tab treatment: a document
    // reload would stop the very playback the header is reporting.
    expect(link).not.toHaveAttribute("target");
  });

  it("leaves the record unlinked without a page", () => {
    renderPlayer();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("names the track in a tooltip once the pointer has rested on the record", () => {
    vi.useFakeTimers();
    renderPlayer({ href: "/work/night-drive" });
    const record = screen.getByRole("link", {
      name: "Go to the page playing Night Drive — Nova",
    });

    fireEvent.mouseEnter(record);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("aria-hidden", "true");

    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("tooltip")).toHaveTextContent("Night Drive — Nova");
    vi.useRealTimers();
  });

  it("cuts a long track name down before it reaches the frame", () => {
    vi.useFakeTimers();
    renderPlayer({
      title: "An Extremely Long Track Name That Never Ends",
      artist: "The Interminable Orchestra",
    });

    fireEvent.mouseEnter(screen.getByText("◉"));
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("aria-hidden", "true");

    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "An Extremely Long Track Name That Never…",
    );
    expect(
      screen.getByRole("group", {
        name: "Now playing: An Extremely Long Track Name That Never Ends — The Interminable Orchestra",
      }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("clears the player", () => {
    const handlers = renderPlayer();

    fireEvent.click(screen.getByRole("button", { name: "Stop playback" }));

    expect(handlers.onStop).toHaveBeenCalledOnce();
  });
});
