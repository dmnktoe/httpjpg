import { fireEvent, render, screen } from "@testing-library/react";

import type { NavItem, WorkItem } from "./header";
import { Navigation } from "./navigation";

const nav: NavItem[] = [
  { name: "home", href: "/" },
  { name: "about", href: "/about" },
];

function makeWork(count: number, prefix: string): WorkItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    slug: `${prefix}-${i}`,
    title: `${prefix} title ${i}`,
    isDraft: false,
    isExternal: false,
  }));
}

describe("Navigation", () => {
  it("renders the music/pics link inside the intro block", () => {
    render(<Navigation nav={nav} personalWork={[]} clientWork={[]} />);
    const musicLink = screen.getByRole("link", { name: /music/i });
    expect(musicLink).toHaveAttribute("href", "/feed-xml_html");
  });

  it("hides the more toggle when there are 5 or fewer work items", () => {
    render(<Navigation nav={nav} personalWork={makeWork(5, "p")} clientWork={[]} />);
    expect(screen.queryByRole("button", { name: /more/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /less/i })).not.toBeInTheDocument();
  });

  it("shows only the first 5 personal items and a more toggle with the remaining count", () => {
    render(<Navigation nav={nav} personalWork={makeWork(8, "p")} clientWork={[]} />);

    expect(screen.getByText(/p title 0/)).toBeInTheDocument();
    expect(screen.getByText(/p title 4/)).toBeInTheDocument();
    expect(screen.queryByText(/p title 5/)).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: /▾ more \(3\)/ })).toBeInTheDocument();
  });

  it("reveals every remaining item and the less toggle when more is clicked", () => {
    render(<Navigation nav={nav} personalWork={makeWork(12, "p")} clientWork={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /▾ more \(7\)/ }));

    expect(screen.getByText(/p title 5/)).toBeInTheDocument();
    expect(screen.getByText(/p title 11/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /▴ less/ })).toBeInTheDocument();
  });

  it("keeps the more toggle in the DOM (hidden) when expanded so the column height stays constant", () => {
    render(<Navigation nav={nav} personalWork={makeWork(8, "p")} clientWork={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /▾ more \(3\)/ }));

    const placeholder = screen.getByText(/▾ more \(3\)/);
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(placeholder).toHaveAttribute("tabIndex", "-1");
  });

  it("collapses back to the initial 5 items when less is clicked", () => {
    render(<Navigation nav={nav} personalWork={makeWork(8, "p")} clientWork={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /▾ more \(3\)/ }));
    fireEvent.click(screen.getByRole("button", { name: /▴ less/ }));

    expect(screen.queryByText(/p title 5/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /▴ less/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /▾ more \(3\)/ })).toBeInTheDocument();
  });

  it("expands personal and client columns independently", () => {
    render(<Navigation nav={nav} personalWork={makeWork(8, "p")} clientWork={makeWork(7, "c")} />);

    expect(screen.getByRole("button", { name: /▾ more \(3\)/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /▾ more \(2\)/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /▾ more \(3\)/ }));

    expect(screen.getByText(/p title 7/)).toBeInTheDocument();
    expect(screen.queryByText(/c title 5/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /▾ more \(2\)/ })).toBeInTheDocument();
  });
});
