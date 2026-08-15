import { render, screen } from "@testing-library/react";

import { MobileMenuBackdrop } from "./mobile-menu-backdrop";

describe("MobileMenuBackdrop", () => {
  it("lays the glyphs out on a 14×28 lattice that fills the backdrop", () => {
    render(<MobileMenuBackdrop />);

    const root = screen.getByTestId("mobile-menu-backdrop");
    const glyphs = root.querySelectorAll("span");

    expect(glyphs).toHaveLength(14 * 28);
    expect(glyphs[0]).toHaveTextContent("✦");
    expect(glyphs[1]).toHaveTextContent("·");
    expect(glyphs[0]).not.toHaveAttribute("style");

    const lattice = glyphs[0]?.parentElement;
    const latticeStyle = lattice?.getAttribute("style") ?? "";
    expect(latticeStyle).toContain("repeat(14");
    expect(latticeStyle).toContain("repeat(28");
    expect(lattice).toHaveStyle({ display: "grid", width: "100%", height: "100%" });
  });
});
