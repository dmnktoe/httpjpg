import { render, screen } from "@testing-library/react";

import { CopyrightLabel } from "./copyright-label";

describe("CopyrightLabel", () => {
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

  it("renders the asset source on its own line", () => {
    render(<CopyrightLabel text="Studio" source="flickr.com/x" position="below" />);

    expect(screen.getByText("© Studio")).toBeInTheDocument();
    expect(screen.getByText("flickr.com/x")).toBeInTheDocument();
  });
});
