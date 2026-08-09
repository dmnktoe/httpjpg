import { render, screen } from "@testing-library/react";

const { mockReducedMotion, mockInView, lastMotionProps } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
  mockInView: vi.fn<() => boolean>(),
  lastMotionProps: { current: null as Record<string, unknown> | null },
}));

vi.mock("motion/react", () => ({
  useReducedMotion: () => mockReducedMotion(),
  useInView: () => mockInView(),
  m: {
    span: ({ children, ...props }: { children: React.ReactNode }) => {
      lastMotionProps.current = props as Record<string, unknown>;
      return <span {...props}>{children}</span>;
    },
  },
}));

import { ShimmeringText } from "./shimmering-text";

beforeEach(() => {
  mockReducedMotion.mockReturnValue(false);
  mockInView.mockReturnValue(true);
  lastMotionProps.current = null;
});

describe("ShimmeringText", () => {
  it("renders the text", () => {
    render(<ShimmeringText text="⌘+K" />);

    expect(screen.getByText("⌘+K")).toBeInTheDocument();
  });

  it("layers a sweep gradient over the base colour", () => {
    render(<ShimmeringText text="hello" color="#111111" shimmerColor="#93C5FD" />);

    const style = lastMotionProps.current?.style as { backgroundImage: string };
    expect(style.backgroundImage).toContain("#93C5FD");
    expect(style.backgroundImage).toContain("linear-gradient(#111111, #111111)");
  });

  it("scales the sweep with the text length", () => {
    render(<ShimmeringText text="abcd" spread={3} />);

    const style = lastMotionProps.current?.style as { backgroundImage: string };
    expect(style.backgroundImage).toContain("12px");
  });

  it("sweeps once when repeat is off", () => {
    render(<ShimmeringText text="hello" repeat={false} />);

    const transition = lastMotionProps.current?.transition as {
      backgroundPosition: { repeat: number };
    };
    expect(transition.backgroundPosition.repeat).toBe(0);
  });

  it("loops forever by default", () => {
    render(<ShimmeringText text="hello" />);

    const transition = lastMotionProps.current?.transition as {
      backgroundPosition: { repeat: number };
    };
    expect(transition.backgroundPosition.repeat).toBe(Infinity);
  });

  it("holds still until scrolled into view", () => {
    mockInView.mockReturnValue(false);
    render(<ShimmeringText text="hello" />);

    expect(lastMotionProps.current?.animate).toEqual({});
  });

  it("starts immediately when startOnView is off, even out of view", () => {
    mockInView.mockReturnValue(false);
    render(<ShimmeringText text="hello" startOnView={false} />);

    expect(lastMotionProps.current?.animate).toMatchObject({ opacity: 1 });
  });

  it("renders plain text without a gradient when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);
    render(<ShimmeringText text="hello" color="#111111" />);

    expect(screen.getByText("hello")).toHaveStyle({ color: "#111111" });
    expect(lastMotionProps.current).toBeNull();
  });
});
