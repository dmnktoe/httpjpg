import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/ui", () => ({
  CustomCursor: (props: { size: number; symbol: string }) => (
    <div data-testid="custom-cursor" data-size={props.size} data-symbol={props.symbol} />
  ),
  MouseTrail: (props: { character: string; count: number }) => (
    <div data-testid="mouse-trail" data-character={props.character} data-count={props.count} />
  ),
}));

import { CustomCursorWrapper } from "./custom-cursor-wrapper";

describe("CustomCursorWrapper", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when both features are disabled", () => {
    render(<CustomCursorWrapper cursorEnabled={false} trailEnabled={false} />);

    expect(screen.queryByTestId("custom-cursor")).toBeNull();
    expect(screen.queryByTestId("mouse-trail")).toBeNull();
  });

  it("renders only the cursor when the trail is disabled", () => {
    render(<CustomCursorWrapper cursorEnabled trailEnabled={false} />);

    expect(screen.getByTestId("custom-cursor")).toHaveAttribute("data-symbol", "✧");
    expect(screen.queryByTestId("mouse-trail")).toBeNull();
  });

  it("renders only the trail when the cursor is disabled", () => {
    render(<CustomCursorWrapper cursorEnabled={false} trailEnabled />);

    expect(screen.queryByTestId("custom-cursor")).toBeNull();
    expect(screen.getByTestId("mouse-trail")).toHaveAttribute("data-character", "✧");
  });

  it("renders both when enabled", () => {
    render(<CustomCursorWrapper cursorEnabled trailEnabled />);

    expect(screen.getByTestId("custom-cursor")).toBeInTheDocument();
    expect(screen.getByTestId("mouse-trail")).toBeInTheDocument();
  });
});
