import { render, screen } from "@testing-library/react";

import { Marquee } from "./marquee";

const { mockReducedMotion } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
}));
vi.mock("framer-motion", () => ({ useReducedMotion: () => mockReducedMotion() }));

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
});
