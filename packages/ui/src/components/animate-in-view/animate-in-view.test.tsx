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
    div: ({ children, ...props }: { children: React.ReactNode }) => {
      lastMotionProps.current = props as Record<string, unknown>;
      return <div {...props}>{children}</div>;
    },
  },
}));

import { AnimateInView, type AnimationType } from "./animate-in-view";

beforeEach(() => {
  mockReducedMotion.mockReturnValue(false);
  mockInView.mockReturnValue(true);
  lastMotionProps.current = null;
});

describe("AnimateInView", () => {
  it("renders children", () => {
    render(<AnimateInView>Animated Content</AnimateInView>);

    expect(screen.getByText("Animated Content")).toBeInTheDocument();
  });

  it("tweens from hidden to visible when in view", () => {
    render(
      <AnimateInView animation="fadeIn" duration={0.8} delay={0.2}>
        Hello
      </AnimateInView>,
    );

    expect(lastMotionProps.current?.initial).toBe("hidden");
    expect(lastMotionProps.current?.animate).toBe("visible");
    expect(lastMotionProps.current?.transition).toEqual({
      delay: 0.2,
      duration: 0.8,
      ease: "easeOut",
    });
  });

  it("stays hidden until scrolled into view", () => {
    mockInView.mockReturnValue(false);
    render(<AnimateInView animation="zoomIn">Hello</AnimateInView>);

    expect(lastMotionProps.current?.animate).toBe("hidden");
  });

  it("renders children without a tween when reduced motion is preferred", () => {
    mockReducedMotion.mockReturnValue(true);
    render(
      <AnimateInView animation="sharpen" duration={1.2} delay={1}>
        Hello
      </AnimateInView>,
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(lastMotionProps.current).toBeNull();
  });

  it("renders children without a tween when animation is none", () => {
    render(<AnimateInView animation="none">Hello</AnimateInView>);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(lastMotionProps.current).toBeNull();
  });

  it("renders children without a tween when animation is empty", () => {
    render(<AnimateInView animation={"" as AnimationType}>Hello</AnimateInView>);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(lastMotionProps.current).toBeNull();
  });

  it("stays visible while ready is false so a loader is not hidden", () => {
    mockInView.mockReturnValue(false);
    render(
      <AnimateInView animation="sharpen" ready={false}>
        Hello
      </AnimateInView>,
    );

    expect(lastMotionProps.current?.initial).toBe("visible");
    expect(lastMotionProps.current?.animate).toBe("visible");
  });
});
