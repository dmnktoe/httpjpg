import { render } from "@testing-library/react";

import { MouseTrail } from "./mouse-trail";

const { mockReducedMotion } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
}));
vi.mock("framer-motion", () => ({ useReducedMotion: () => mockReducedMotion() }));

describe("MouseTrail", () => {
  it("renders the trail overlay by default", () => {
    mockReducedMotion.mockReturnValue(false);
    const { container } = render(<MouseTrail />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders nothing when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);
    const { container } = render(<MouseTrail />);
    expect(container.firstChild).toBeNull();
  });
});
