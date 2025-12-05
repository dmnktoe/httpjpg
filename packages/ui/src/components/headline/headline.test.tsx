import { render, screen } from "@testing-library/react";
import { Headline } from "./headline";

describe("Headline", () => {
  it("renders h1 by default", () => {
    render(<Headline>Test Heading</Headline>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Heading");
  });

  it("renders h2 when level is 2", () => {
    render(<Headline level={2}>Level 2</Headline>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Level 2");
  });

  it("renders h3 when level is 3", () => {
    render(<Headline level={3}>Level 3</Headline>);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Level 3");
  });

  it("applies default font treatment", () => {
    render(<Headline>Default</Headline>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("applies display font treatment", () => {
    render(<Headline fontTreatment="display">Display</Headline>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});
