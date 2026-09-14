import { render, screen } from "@testing-library/react";

import { Section } from "./section";

describe("Section", () => {
  it("renders as a section and forwards a ref", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Section ref={ref}>body</Section>);
    expect(screen.getByText("body").closest("section")).not.toBeNull();
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("can wrap children in a Container", () => {
    render(
      <Section useContainer containerSize="sm" containerAlign="left">
        nested
      </Section>,
    );
    expect(screen.getByText("nested")).toBeInTheDocument();
  });

  it("can drop the default full width", () => {
    render(<Section fullWidth={false}>narrow</Section>);
    expect(screen.getByText("narrow")).toBeInTheDocument();
  });
});
