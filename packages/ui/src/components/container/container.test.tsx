import { render, screen } from "@testing-library/react";

import { Container } from "./container";

describe("Container", () => {
  it("renders children and forwards a ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Container ref={ref} data-testid="container">
        inside
      </Container>,
    );
    expect(screen.getByText("inside")).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("caps its width in rem, so a page that scales with the viewport scales it too", () => {
    render(
      <Container size="lg" data-testid="container">
        wide
      </Container>,
    );

    expect(screen.getByTestId("container").style.getPropertyValue("--container-max")).toBe("64rem");
  });

  it("accepts size, padding, and uncentered layout", () => {
    render(
      <Container size="sm" px={2} py={4} center={false}>
        narrow
      </Container>,
    );
    expect(screen.getByText("narrow")).toBeInTheDocument();
  });
});
