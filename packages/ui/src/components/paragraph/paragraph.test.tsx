import { render, screen } from "@testing-library/react";

import { Paragraph } from "./paragraph";

describe("Paragraph", () => {
  it("renders as a p by default and can switch element", () => {
    const { rerender } = render(<Paragraph>Hello</Paragraph>);
    expect(screen.getByText("Hello").tagName).toBe("P");

    rerender(<Paragraph as="span">Hello</Paragraph>);
    expect(screen.getByText("Hello").tagName).toBe("SPAN");
  });

  it("forwards a ref to the rendered element", () => {
    const ref = { current: null as HTMLParagraphElement | null };
    render(<Paragraph ref={ref}>ref</Paragraph>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it("applies size, color, weight, align, and spacing variants", () => {
    render(
      <Paragraph size="lg" color="muted" weight="semibold" align="center" spacing>
        variants
      </Paragraph>,
    );
    expect(screen.getByText("variants")).toBeInTheDocument();
  });

  it("resolves maxWidth true, presets, and raw CSS lengths", () => {
    const { rerender } = render(<Paragraph maxWidth>readable</Paragraph>);
    expect(screen.getByText("readable")).toBeInTheDocument();

    rerender(<Paragraph maxWidth="narrow">narrow</Paragraph>);
    expect(screen.getByText("narrow")).toBeInTheDocument();

    rerender(<Paragraph maxWidth="40ch">custom</Paragraph>);
    expect(screen.getByText("custom")).toBeInTheDocument();
  });
});
