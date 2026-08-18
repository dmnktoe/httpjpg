import { render, screen } from "@testing-library/react";

import { CopyrightLabel, isInlineCopyright } from "./copyright-label";

describe("isInlineCopyright", () => {
  it("is false only for the below variant", () => {
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

  it("renders as a span so it can sit inside phrasing content", () => {
    const { container } = render(<CopyrightLabel text="Studio" position="below" />);

    expect(container.querySelector("div")).toBeNull();
    expect(container.querySelector("span")).toHaveTextContent("© Studio");
  });

  it("renders inline credits as a span too", () => {
    const { container } = render(<CopyrightLabel text="Studio" position="inline-white" />);

    expect(container.querySelector("div")).toBeNull();
    expect(screen.getByText("© Studio").tagName).toBe("SPAN");
  });

  it("prepends the copyright symbol", () => {
    render(<CopyrightLabel text="2025 Studio" />);

    expect(screen.getByText("© 2025 Studio")).toBeInTheDocument();
  });

  it("does not double the symbol when the text already has one", () => {
    render(<CopyrightLabel text="© 2025 Studio" />);

    expect(screen.getByText("© 2025 Studio")).toBeInTheDocument();
    expect(screen.queryByText("© © 2025 Studio")).not.toBeInTheDocument();
  });

  it("renders the asset source on its own line", () => {
    render(<CopyrightLabel text="Studio" source="flickr.com/x" position="below" />);

    expect(screen.getByText("© Studio")).toBeInTheDocument();
    expect(screen.getByText("flickr.com/x")).toBeInTheDocument();
  });

  it("renders source alone when there is no copyright text", () => {
    render(<CopyrightLabel source="peach.blender.org" />);

    expect(screen.getByText("peach.blender.org")).toBeInTheDocument();
    expect(screen.queryByText(/©/)).not.toBeInTheDocument();
  });
});
