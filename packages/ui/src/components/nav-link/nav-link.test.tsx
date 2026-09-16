import { render, screen } from "@testing-library/react";

import { NavLink } from "./nav-link";

describe("NavLink", () => {
  it("renders an internal path through Next.js Link", () => {
    render(<NavLink href="/work/outlet">Outlet</NavLink>);
    const link = screen.getByRole("link", { name: "Outlet" });
    expect(link).toHaveAttribute("href", "/work/outlet");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens http(s) URLs in a new tab with the external glyph", () => {
    render(
      <NavLink href="https://example.com" variant="websites" className="extra">
        Example
      </NavLink>,
    );
    const link = screen.getByRole("link", { name: "Example" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveClass("extra");
    expect(link.querySelector("[aria-hidden='true']")).toHaveTextContent("↗");
  });

  it("can hide the glyph on an otherwise external URL", () => {
    render(
      <NavLink href="https://example.com" showExternalIcon={false}>
        Example
      </NavLink>,
    );
    expect(
      screen.getByRole("link", { name: "Example" }).querySelector("[aria-hidden='true']"),
    ).toBeNull();
  });

  it("merges className onto the rendered anchor", () => {
    render(
      <NavLink href="/work/outlet" className="extra">
        Outlet
      </NavLink>,
    );
    expect(screen.getByRole("link", { name: "Outlet" })).toHaveClass("extra");
  });
});
