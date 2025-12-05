import { render, screen } from "@testing-library/react";
import { Box } from "./box";

describe("Box", () => {
  it("renders children correctly", () => {
    render(<Box>Test Content</Box>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders as div by default", () => {
    const { container } = render(<Box>Content</Box>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders as specified element", () => {
    const { container } = render(<Box as="section">Content</Box>);
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("forwards className", () => {
    render(<Box className="custom-class">Content</Box>);
    const box = screen.getByText("Content");
    expect(box).toHaveClass("custom-class");
  });
});
