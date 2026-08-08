import { act, render, screen } from "@testing-library/react";

import { MouseTrail } from "./mouse-trail";

const { mockReducedMotion } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
}));
vi.mock("motion/react", () => ({ useReducedMotion: () => mockReducedMotion() }));

let clock = 0;

function moveMouse(x: number, y: number) {
  clock += 100;
  act(() => {
    window.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y }));
  });
}

beforeEach(() => {
  clock = 0;
  vi.spyOn(Date, "now").mockImplementation(() => clock);
  mockReducedMotion.mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MouseTrail", () => {
  it("renders the trail overlay by default", () => {
    const { container } = render(<MouseTrail />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders nothing when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);
    const { container } = render(<MouseTrail />);
    expect(container.firstChild).toBeNull();
  });

  it("spawns a particle at the pointer position", () => {
    render(<MouseTrail character="✧" />);

    moveMouse(40, 80);

    const particle = screen.getByText("✧");
    expect(particle).toHaveStyle({ left: "40px", top: "80px" });
  });

  it("follows the page theme by default", () => {
    render(<MouseTrail character="✧" />);

    moveMouse(10, 10);

    expect(screen.getByText("✧").style.color).toBe("var(--colors-page-fg)");
  });

  it("applies the configured color and size to each particle", () => {
    render(<MouseTrail character="✧" color="red" size="16px" />);

    moveMouse(10, 10);

    expect(screen.getByText("✧")).toHaveStyle({ color: "rgb(255, 0, 0)", fontSize: "16px" });
  });

  it("removes its listener on unmount", () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<MouseTrail />);
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });
});
