import { render, screen } from "@testing-library/react";

vi.mock("motion/react", () => ({
  domMax: {},
  LazyMotion: ({ children }: { children: unknown }) => children,
}));

import { LazyMotionProvider } from "./lazy-motion-provider";

describe("LazyMotionProvider", () => {
  it("renders children", () => {
    render(
      <LazyMotionProvider>
        <span>inside</span>
      </LazyMotionProvider>,
    );
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});
