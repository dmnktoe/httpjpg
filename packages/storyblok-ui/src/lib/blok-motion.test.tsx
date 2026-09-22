import { render, screen } from "@testing-library/react";

import { BlokMotion } from "./blok-motion";

describe("BlokMotion", () => {
  it("renders children without a wrapper when animation is none", () => {
    const { container } = render(
      <BlokMotion animation="none">
        <span>plain</span>
      </BlokMotion>,
    );
    expect(container.innerHTML).toBe("<span>plain</span>");
  });

  it("renders children when animation is unset", () => {
    render(
      <BlokMotion>
        <span>plain</span>
      </BlokMotion>,
    );
    expect(screen.getByText("plain")).not.toBeNull();
  });
});
