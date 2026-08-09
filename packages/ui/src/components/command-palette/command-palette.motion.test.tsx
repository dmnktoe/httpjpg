import { render, screen } from "@testing-library/react";
import { forwardRef } from "react";

const { mockReducedMotion, motionProps } = vi.hoisted(() => ({
  mockReducedMotion: vi.fn<() => boolean | null>(),
  motionProps: { current: [] as Array<Record<string, unknown>> },
}));

vi.mock("motion/react", () => ({
  useReducedMotion: () => mockReducedMotion(),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  m: {
    div: forwardRef<HTMLDivElement, Record<string, unknown>>(function MockMotionDiv(props, ref) {
      const { children, initial, animate, exit, transition, ...rest } = props;
      motionProps.current.push({ initial, animate, exit, transition });
      return (
        <div ref={ref} {...rest}>
          {children as React.ReactNode}
        </div>
      );
    }),
  },
}));

import { CommandPalette } from "./command-palette";

function renderPalette() {
  render(
    <CommandPalette
      open
      query="poster"
      results={[]}
      onQueryChange={vi.fn()}
      onClose={vi.fn()}
      onSelect={vi.fn()}
      onAsk={vi.fn()}
    />,
  );
  const [backdrop, dialog] = motionProps.current;
  return { backdrop, dialog };
}

beforeEach(() => {
  motionProps.current = [];
  mockReducedMotion.mockReturnValue(false);
});

describe("CommandPalette motion", () => {
  it("fades the backdrop in and out", () => {
    const { backdrop } = renderPalette();

    expect(backdrop.initial).toEqual({ opacity: 0 });
    expect(backdrop.animate).toEqual({ opacity: 1 });
    expect(backdrop.exit).toMatchObject({ opacity: 0 });
  });

  it("lifts and scales the dialog in", () => {
    const { dialog } = renderPalette();

    expect(dialog.initial).toEqual({ opacity: 0, y: -8, scale: 0.98 });
    expect(dialog.animate).toEqual({ opacity: 1, y: 0, scale: 1 });
  });

  it("leaves faster than it arrives", () => {
    const { dialog } = renderPalette();

    const enter = dialog.transition as { duration: number };
    const exit = (dialog.exit as { transition: { duration: number } }).transition;
    expect(exit.duration).toBeLessThan(enter.duration);
  });

  it("keeps the fade but drops the movement under reduced motion", () => {
    mockReducedMotion.mockReturnValue(true);

    const { backdrop, dialog } = renderPalette();

    expect(backdrop.animate).toEqual({ opacity: 1 });
    expect(dialog.initial).toEqual({ opacity: 0 });
    expect(dialog.animate).toEqual({ opacity: 1 });
    expect(dialog.exit).toMatchObject({ opacity: 0 });
    expect(dialog.initial).not.toHaveProperty("scale");
    expect(dialog.initial).not.toHaveProperty("y");
  });

  it("still renders the dialog itself", () => {
    renderPalette();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
