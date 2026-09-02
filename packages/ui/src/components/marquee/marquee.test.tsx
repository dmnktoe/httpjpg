import { fireEvent, render, screen } from "@testing-library/react";

import { Marquee } from "./marquee";

const { mockReducedMotion } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
}));
vi.mock("motion/react", () => ({ useReducedMotion: () => mockReducedMotion() }));

describe("Marquee", () => {
  it("scrolls the content (repeated copies + keyframes) by default", () => {
    mockReducedMotion.mockReturnValue(false);
    const { container } = render(<Marquee repeat={3}>scroll me</Marquee>);

    expect(container.querySelector("style")).not.toBeNull();
    expect(screen.getAllByText("scroll me")).toHaveLength(3);
  });

  it("renders the content once and statically when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);
    const { container } = render(<Marquee repeat={3}>scroll me</Marquee>);

    expect(container.querySelector("style")).toBeNull();
    expect(screen.getAllByText("scroll me")).toHaveLength(1);
  });

  it("reverses the animation when scrolling right", () => {
    mockReducedMotion.mockReturnValue(false);
    const { container } = render(
      <Marquee direction="right" repeat={2}>
        scroll me
      </Marquee>,
    );
    const animated = container.querySelector("[style]") as HTMLElement | null;
    expect(animated?.style.animation).toContain("reverse");
  });

  it("inserts an iOS-style pause into the keyframes", () => {
    mockReducedMotion.mockReturnValue(false);
    const { container } = render(
      <Marquee iosStyle pauseDuration={2} speed={20} repeat={2}>
        scroll me
      </Marquee>,
    );
    expect(container.querySelector("style")?.textContent).toContain("%");
  });

  it("pauses on hover when asked, and ignores hover otherwise", () => {
    mockReducedMotion.mockReturnValue(false);
    const { container, rerender } = render(
      <Marquee pauseOnHover repeat={2}>
        scroll me
      </Marquee>,
    );
    const animated = container.querySelector("[style]") as HTMLElement;
    fireEvent.mouseEnter(animated);
    expect(animated.style.animationPlayState).toBe("paused");
    fireEvent.mouseLeave(animated);
    expect(animated.style.animationPlayState).toBe("running");

    rerender(<Marquee repeat={2}>scroll me</Marquee>);
    const next = container.querySelector("[style]") as HTMLElement;
    fireEvent.mouseEnter(next);
    expect(next.style.animationPlayState).not.toBe("paused");
  });
});
