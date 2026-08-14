import { render, screen } from "@testing-library/react";

import { CopyrightLabel } from "./copyright-label";

describe("CopyrightLabel", () => {
  it("renders nothing without text or source", () => {
    const { container } = render(<CopyrightLabel />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the copyright with a prepended symbol", () => {
    render(<CopyrightLabel text="2025 Studio" />);

    expect(screen.getByText("© 2025 Studio")).toBeInTheDocument();
  });

  it("does not double the symbol when the text already has one", () => {
    render(<CopyrightLabel text="© 2025 Studio" />);

    expect(screen.getByText("© 2025 Studio")).toBeInTheDocument();
    expect(screen.queryByText("© © 2025 Studio")).not.toBeInTheDocument();
  });

  it("renders a source line below the copyright", () => {
    render(<CopyrightLabel text="2025 Studio" source="peach.blender.org" />);

    expect(screen.getByText("© 2025 Studio")).toBeInTheDocument();
    expect(screen.getByText("peach.blender.org")).toBeInTheDocument();
  });

  it("renders source alone when there is no copyright text", () => {
    render(<CopyrightLabel source="peach.blender.org" />);

    expect(screen.getByText("peach.blender.org")).toBeInTheDocument();
    expect(screen.queryByText(/©/)).not.toBeInTheDocument();
  });
});
