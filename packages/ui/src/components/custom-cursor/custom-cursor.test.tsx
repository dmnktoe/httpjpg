import { render, screen } from "@testing-library/react";

import { CustomCursor } from "./custom-cursor";

const { mockReducedMotion } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
}));
vi.mock("framer-motion", () => ({ useReducedMotion: () => mockReducedMotion() }));

describe("CustomCursor", () => {
  afterEach(() => {
    document.body.style.cursor = "";
  });

  it("renders the cursor symbol and hides the native cursor by default", () => {
    mockReducedMotion.mockReturnValue(false);
    render(<CustomCursor symbol="✦" />);
    expect(screen.getByText("✦")).toBeInTheDocument();
    expect(document.body.style.cursor).toBe("none");
  });

  it("renders nothing and keeps the native cursor when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);
    const { container } = render(<CustomCursor symbol="✦" />);
    expect(container.firstChild).toBeNull();
    expect(document.body.style.cursor).toBe("");
  });
});
