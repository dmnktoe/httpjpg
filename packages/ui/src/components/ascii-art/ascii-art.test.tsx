import { render, screen } from "@testing-library/react";

import { AsciiArt } from "./ascii-art";

describe("AsciiArt", () => {
  it("renders multi-line content inside a pre element", () => {
    const { container } = render(<AsciiArt>{"a\nb"}</AsciiArt>);
    expect(container.firstChild?.nodeName).toBe("PRE");
  });

  it("marks itself aria-hidden when no label is given", () => {
    const { container } = render(<AsciiArt>x</AsciiArt>);
    expect((container.firstChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("uses role=img and aria-label when label is given", () => {
    render(<AsciiArt label="404 cat">{"=^.^="}</AsciiArt>);
    expect(screen.getByRole("img", { name: "404 cat" })).toBeInTheDocument();
  });
});
