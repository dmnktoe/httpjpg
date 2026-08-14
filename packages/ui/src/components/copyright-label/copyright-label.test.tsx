import { render, screen } from "@testing-library/react";

import { CopyrightLabel, isInlineCopyright } from "./copyright-label";

describe("isInlineCopyright", () => {
  it("is false only for the below position", () => {
    expect(isInlineCopyright("below")).toBe(false);
    expect(isInlineCopyright("overlay")).toBe(true);
    expect(isInlineCopyright("inline-white")).toBe(true);
    expect(isInlineCopyright("inline-black")).toBe(true);
  });
});

describe("CopyrightLabel", () => {
  it("renders nothing without text or source", () => {
    const { container } = render(<CopyrightLabel />);
    expect(container).toBeEmptyDOMElement();
  });

  it("prepends the copyright symbol", () => {
    render(<CopyrightLabel text="2025 httpjpg" />);
    expect(screen.getByText("© 2025 httpjpg")).toBeInTheDocument();
  });

  it("renders a source line under the credit", () => {
    render(<CopyrightLabel text="2025 httpjpg" source="unsplash.com/@httpjpg" />);
    expect(screen.getByText("© 2025 httpjpg")).toBeInTheDocument();
    expect(screen.getByText("unsplash.com/@httpjpg")).toBeInTheDocument();
  });

  it("renders a source without a copyright line", () => {
    render(<CopyrightLabel source="storyblok.com" />);
    expect(screen.queryByText(/^©/)).not.toBeInTheDocument();
    expect(screen.getByText("storyblok.com")).toBeInTheDocument();
  });
});
