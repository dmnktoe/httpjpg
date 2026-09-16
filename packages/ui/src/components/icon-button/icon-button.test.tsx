import { render, screen } from "@testing-library/react";

import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("renders a labelled button that defaults to type=button", () => {
    render(<IconButton icon="close" aria-label="Close" />);
    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("forwards a ref and className", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<IconButton ref={ref} icon="play" aria-label="Play" className="extra" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(screen.getByRole("button", { name: "Play" })).toHaveClass("extra");
  });

  it("accepts variant, size, and a submit type", () => {
    const { rerender } = render(
      <IconButton icon="pause" aria-label="Pause" variant="ghost" size="sm" />,
    );
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    rerender(
      <IconButton
        icon="arrow-right"
        aria-label="Next"
        variant="slideshow"
        size="lg"
        type="submit"
      />,
    );
    expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute("type", "submit");
  });
});
