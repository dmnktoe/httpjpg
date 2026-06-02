import { render } from "@testing-library/react";

import { ImageOverlay } from "./image-overlay";
import { OVERLAY_PATTERNS, type OverlayPattern } from "./patterns";

const VALID_KEYS = Object.keys(OVERLAY_PATTERNS);

function patternOf(container: HTMLElement): string | null {
  return (
    container.querySelector("[data-overlay-pattern]")?.getAttribute("data-overlay-pattern") ?? null
  );
}

describe("ImageOverlay", () => {
  it("renders a known pattern as-is", () => {
    const { container } = render(<ImageOverlay pattern="stars" />);
    expect(patternOf(container)).toBe("stars");
  });

  it("renders nothing for the 'none' pattern", () => {
    const { container } = render(<ImageOverlay pattern="none" />);
    expect(container.firstChild).toBeNull();
  });

  it("falls back to a valid pattern for an empty value", () => {
    const { container } = render(<ImageOverlay pattern={"" as OverlayPattern} seed="foo" />);
    expect(VALID_KEYS).toContain(patternOf(container));
  });

  it("falls back to a valid pattern for an unknown value", () => {
    const { container } = render(<ImageOverlay pattern={"bogus" as OverlayPattern} seed="foo" />);
    expect(VALID_KEYS).toContain(patternOf(container));
  });

  it("does not treat prototype keys as valid patterns", () => {
    const { container } = render(
      <ImageOverlay pattern={"__proto__" as OverlayPattern} seed="foo" />,
    );
    const resolved = patternOf(container);
    expect(resolved).not.toBe("__proto__");
    expect(VALID_KEYS).toContain(resolved);
  });
});
