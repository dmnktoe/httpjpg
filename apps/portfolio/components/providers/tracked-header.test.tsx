import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@httpjpg/analytics", () => ({
  trackNavClick: vi.fn(),
}));

vi.mock("@httpjpg/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@httpjpg/ui")>();
  return {
    ...actual,
    Header: ({
      onNavClick,
    }: {
      onNavClick?: (payload: {
        label: string;
        href: string;
        source: "desktop" | "mobile";
        kind: "menu" | "work" | "home" | "music";
      }) => void;
    }) => (
      <button
        type="button"
        onClick={() =>
          onNavClick?.({
            label: "work",
            href: "/work",
            source: "desktop",
            kind: "menu",
          })
        }
      >
        nav
      </button>
    ),
  };
});

import { trackNavClick } from "@httpjpg/analytics";

import { TrackedHeader } from "./tracked-header";

describe("TrackedHeader", () => {
  it("fans nav clicks into trackNavClick", () => {
    render(<TrackedHeader nav={[{ name: "work", href: "/work" }]} />);

    fireEvent.click(screen.getByRole("button", { name: "nav" }));

    expect(trackNavClick).toHaveBeenCalledWith({
      label: "work",
      href: "/work",
      source: "desktop",
      kind: "menu",
    });
  });
});
