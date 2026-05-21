import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import type { NavItem, WorkItem } from "./header";
import { Navigation } from "./navigation";

const mockPathname = vi.fn<() => string>(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

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

  it("collapses an expanded column when the pathname changes", () => {
    mockPathname.mockReturnValue("/");
    const { rerender } = render(
      <Navigation nav={nav} personalWork={makeWork(8, "p")} clientWork={[]} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /▾ more \(3\)/ }));
    expect(screen.getByRole("button", { name: /▴ less/ })).toBeInTheDocument();

    mockPathname.mockReturnValue("/work/something");
    rerender(<Navigation nav={nav} personalWork={makeWork(8, "p")} clientWork={[]} />);

    expect(screen.queryByRole("button", { name: /▴ less/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/p title 5/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /▾ more \(3\)/ })).toBeInTheDocument();
  });

  it("collapses back to the initial 5 items when less is clicked", () => {
    render(<Navigation nav={nav} personalWork={makeWork(8, "p")} clientWork={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /▾ more \(3\)/ }));
    fireEvent.click(screen.getByRole("button", { name: /▴ less/ }));

    expect(screen.queryByText(/p title 5/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /▴ less/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /▾ more \(3\)/ })).toBeInTheDocument();
  });

  it("renders a 14x14 favicon image next to external pages-column links", () => {
    const { container } = render(
      <Navigation
        nav={[
          { name: "home", href: "/" },
          { name: "github", href: "https://github.com/dmnktoe", isExternal: true },
        ]}
        personalWork={[]}
        clientWork={[]}
      />,
    );

    const favicons = Array.from(container.querySelectorAll("img")).filter((img) =>
      img.getAttribute("src")?.includes("google.com/s2/favicons"),
    );

    expect(favicons).toHaveLength(1);
    expect(favicons[0]).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=github.com&sz=16",
    );
    expect(favicons[0]).toHaveAttribute("width", "14");
    expect(favicons[0]).toHaveAttribute("height", "14");
  });

  it("renders favicons for external work items in the recent work columns", () => {
    const { container } = render(
      <Navigation
        nav={[]}
        personalWork={[
          {
            id: "p-ext",
            slug: "https://dribbble.com/dmnktoe",
            title: "external personal",
            isExternal: true,
          },
          { id: "p-int", slug: "internal-piece", title: "internal personal", isExternal: false },
        ]}
        clientWork={[
          {
            id: "c-ext",
            slug: "https://acme.com",
            title: "external client",
            isExternal: true,
          },
        ]}
      />,
    );

    const sources = Array.from(container.querySelectorAll("img"))
      .map((img) => img.getAttribute("src") ?? "")
      .filter((src) => src.includes("google.com/s2/favicons"));

    expect(sources).toEqual([
      "https://www.google.com/s2/favicons?domain=dribbble.com&sz=16",
      "https://www.google.com/s2/favicons?domain=acme.com&sz=16",
    ]);
  });

  it("renders a favicon from externalUrl on internal work that has a preview link", () => {
    const { container } = render(
      <Navigation
        nav={[]}
        personalWork={[]}
        clientWork={[
          {
            id: "c-preview",
            slug: "acme-case-study",
            title: "Acme case study",
            isExternal: false,
            externalUrl: "https://acme.com/launch",
          },
        ]}
      />,
    );

    const sources = Array.from(container.querySelectorAll("img"))
      .map((img) => img.getAttribute("src") ?? "")
      .filter((src) => src.includes("google.com/s2/favicons"));

    expect(sources).toEqual(["https://www.google.com/s2/favicons?domain=acme.com&sz=16"]);
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
