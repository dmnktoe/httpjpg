import { render, screen } from "@testing-library/react";

import { FooterStatusLine } from "./footer-status-line";
import { FooterStatusLineSeparator } from "./footer-status-line-separator";
import { FooterStatusLineText } from "./footer-status-line-text";
import { FooterStatusLineThumb } from "./footer-status-line-thumb";

describe("FooterStatusLine", () => {
  it("punctuates the label so callers do not carry the colon", () => {
    render(<FooterStatusLine label="discogs">Endtroducing</FooterStatusLine>);

    expect(screen.getByText("discogs:")).toBeInTheDocument();
  });

  it("renders without a label", () => {
    render(<FooterStatusLine>Platinum</FooterStatusLine>);

    expect(screen.getByText("Platinum")).toBeInTheDocument();
    expect(screen.queryByText(":")).not.toBeInTheDocument();
  });

  it("links out safely when given an href", () => {
    render(
      <FooterStatusLine label="letterboxd" href="https://letterboxd.com/film/dune">
        Dune
      </FooterStatusLine>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://letterboxd.com/film/dune");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the placeholder instead of children while loading", () => {
    render(
      <FooterStatusLine label="x" loading>
        a post
      </FooterStatusLine>,
    );

    expect(screen.getByText("loading ...")).toBeInTheDocument();
    expect(screen.queryByText("a post")).not.toBeInTheDocument();
  });

  it("does not link while loading, so there is nothing to click through to yet", () => {
    render(<FooterStatusLine label="x" href="https://x.com/post" loading />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("FooterStatusLineText", () => {
  it("renders its children", () => {
    render(<FooterStatusLineText>Selected Ambient Works</FooterStatusLineText>);

    expect(screen.getByText("Selected Ambient Works")).toBeInTheDocument();
  });
});

describe("FooterStatusLineSeparator", () => {
  it("stays out of the accessibility tree", () => {
    render(<FooterStatusLineSeparator />);

    expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards css onto the mark", () => {
    render(<FooterStatusLineSeparator css={{ display: { base: "none", md: "block" } }} />);

    expect(screen.getByText("·")).toHaveClass("d_none", "md:d_block");
  });
});

describe("FooterStatusLineThumb", () => {
  it("defaults to a decorative image", () => {
    render(<FooterStatusLineThumb src="https://example.com/a.png" />);

    expect(screen.getByRole("presentation")).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("keeps an explicit alt for images that carry meaning", () => {
    render(<FooterStatusLineThumb src="/images/trophies/platinum.png" alt="platinum trophy" />);

    expect(screen.getByAltText("platinum trophy")).toBeInTheDocument();
  });

  it("renders sprite art without smoothing", () => {
    render(<FooterStatusLineThumb src="/images/trophies/gold.png" alt="gold trophy" pixelated />);

    expect(screen.getByAltText("gold trophy")).toHaveStyle({ imageRendering: "pixelated" });
  });
});
