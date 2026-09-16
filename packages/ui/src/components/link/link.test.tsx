import { render, screen } from "@testing-library/react";

import { Link } from "./link";

describe("Link", () => {
  it("renders an internal path through Next.js Link", () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("opens http(s) URLs in a new tab with the external glyph", () => {
    render(
      <Link href="https://example.com" className="extra">
        Example
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Example" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveClass("extra");
    expect(link.querySelector("[aria-hidden='true']")).toHaveTextContent("↗");
  });

  it("can hide the glyph on an otherwise external URL", () => {
    render(
      <Link href="https://example.com" showExternalIcon={false}>
        Example
      </Link>,
    );
    expect(
      screen.getByRole("link", { name: "Example" }).querySelector("[aria-hidden='true']"),
    ).toBeNull();
  });

  it("honours an explicit isExternal override on a relative path", () => {
    render(
      <Link href="/local" isExternal>
        Forced
      </Link>,
    );
    expect(screen.getByRole("link", { name: "Forced" })).toHaveAttribute("target", "_blank");
  });

  it("merges className onto the rendered anchor", () => {
    render(
      <Link href="/about" className="extra">
        About
      </Link>,
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveClass("extra");
  });
});
