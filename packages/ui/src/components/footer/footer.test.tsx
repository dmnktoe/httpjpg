import { render, screen } from "@testing-library/react";

import { Footer } from "./footer";

describe("Footer", () => {
  it("renders copyright text", () => {
    render(<Footer copyrightText="© 2026 httpjpg" />);
    expect(screen.getByText("© 2026 httpjpg")).toBeInTheDocument();
  });

  it("renders footer links with separators", () => {
    render(
      <Footer
        footerLinks={[
          { name: "Legal", href: "/legal" },
          { name: "Privacy", href: "/privacy" },
        ]}
      />,
    );
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
  });

  it("renders version as plain text when no href is provided", () => {
    render(<Footer showVersion version="v1.3.0" />);
    expect(screen.getByText("v1.3.0")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "v1.3.0" })).not.toBeInTheDocument();
  });

  it("renders version as a link when versionHref is provided", () => {
    render(
      <Footer
        showVersion
        version="v1.3.0"
        versionHref="https://github.com/dmnktoe/httpjpg/releases/tag/v1.3.0"
      />,
    );
    const link = screen.getByRole("link", { name: "v1.3.0" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://github.com/dmnktoe/httpjpg/releases/tag/v1.3.0");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders lastUpdated text before version", () => {
    render(<Footer showVersion version="v1.3.0" lastUpdated="last updated 2026-05-27" />);
    const container = screen.getByText(/last updated 2026-05-27/);
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("v1.3.0");
  });

  it("renders v-dev fallback when showVersion is true but version is undefined", () => {
    render(<Footer showVersion />);
    expect(screen.getByText("v-dev")).toBeInTheDocument();
  });

  it("does not render version section when showVersion is false", () => {
    render(<Footer version="v1.3.0" />);
    expect(screen.queryByText("v1.3.0")).not.toBeInTheDocument();
  });

  it("renders widgets slot", () => {
    render(<Footer widgets={<div data-testid="widget">Widget</div>} />);
    expect(screen.getByTestId("widget")).toBeInTheDocument();
  });

  it("renders custom children instead of default layout", () => {
    render(<Footer>Custom footer content</Footer>);
    expect(screen.getByText("Custom footer content")).toBeInTheDocument();
  });
});
