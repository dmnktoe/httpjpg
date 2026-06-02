import { act, render } from "@testing-library/react";

import { useParallax } from "./use-parallax";

let observerCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;

function Harness({ speed, disabled, rect }: { speed?: number; disabled?: boolean; rect: DOMRect }) {
  const { ref, offset } = useParallax<HTMLDivElement>({ speed, disabled });
  return (
    <div
      data-testid="el"
      data-offset={offset}
      ref={(node) => {
        ref.current = node;
        if (node) {
          node.getBoundingClientRect = () => rect;
        }
      }}
    />
  );
}

function rectFrom(top: number, height: number): DOMRect {
  return {
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

function offsetOf(container: HTMLElement): number {
  return Number(container.querySelector("[data-testid='el']")?.getAttribute("data-offset"));
}

function intersect() {
  act(() => observerCallback?.([{ isIntersecting: true }]));
}

describe("useParallax", () => {
  beforeEach(() => {
    observerCallback = null;
    window.innerHeight = 800;
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
          observerCallback = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("bounds the offset to +height * speed at the top of its travel", () => {
    // center = 0 → normalized = +1 → offset = height * speed
    const { container } = render(<Harness speed={0.2} rect={rectFrom(-100, 200)} />);
    intersect();
    expect(offsetOf(container)).toBeCloseTo(40);
  });

  it("bounds the offset to -height * speed at the bottom of its travel", () => {
    // center far below viewport → normalized clamps to -1 → offset = -height * speed
    const { container } = render(<Harness speed={0.2} rect={rectFrom(900, 200)} />);
    intersect();
    expect(offsetOf(container)).toBeCloseTo(-40);
  });

  it("is zero at the midpoint of its travel", () => {
    // center = range = (viewportH + height) / 2 = 500 → normalized = 0
    const { container } = render(<Harness speed={0.2} rect={rectFrom(400, 200)} />);
    intersect();
    expect(offsetOf(container)).toBeCloseTo(0);
  });

  it("stays idle when disabled", () => {
    const { container } = render(<Harness speed={0.2} disabled rect={rectFrom(-100, 200)} />);
    expect(observerCallback).toBeNull();
    expect(offsetOf(container)).toBe(0);
  });

  it("stays idle when the user prefers reduced motion", () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { container } = render(<Harness speed={0.2} rect={rectFrom(-100, 200)} />);
    expect(observerCallback).toBeNull();
    expect(offsetOf(container)).toBe(0);
  });
});
