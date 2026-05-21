import { fireEvent, render, screen, within } from "@testing-library/react";

import type { NavItem, WorkItem } from "./header";
import { MobileMenuContent } from "./mobile-menu-content";

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

function renderMenu(props: Partial<React.ComponentProps<typeof MobileMenuContent>> = {}) {
  const setIsOpen = vi.fn();
  const utils = render(
    <MobileMenuContent
      isOpen
      setIsOpen={setIsOpen}
      nav={nav}
      personalWork={[]}
      clientWork={[]}
      {...props}
    />,
  );
  return { ...utils, setIsOpen };
}

describe("MobileMenuContent", () => {
  it("renders the desktop-style intro headline", () => {
    renderMenu();
    expect(screen.getByText(/⇝HE𝓁𝓁O www\.httpjpg\.com/)).toBeInTheDocument();
  });

  it("renders the nav links with the same inline ribbon as the desktop header", () => {
    renderMenu();
    expect(screen.getByRole("link", { name: /^HOME$/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /^ABOUT$/ })).toHaveAttribute("href", "/about");
  });

  it("renders the music/pics link inside the intro section", () => {
    renderMenu();
    const musicLink = screen.getByRole("link", { name: /music/i });
    expect(musicLink).toHaveAttribute("href", "/feed-xml_html");
  });

  it("renders both recent-work section headers", () => {
    renderMenu();
    expect(screen.getByText(/⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S/)).toBeInTheDocument();
    expect(screen.getByText(/⇝ᵣₑcꫀₙₜ ℘ɑׁׅ֮ᧁׁꫀׁׅܻ꯱ׁׅ֒/)).toBeInTheDocument();
  });

  it("renders every work item without applying a cap", () => {
    const personalWork = makeWork(25, "p");
    const clientWork = makeWork(15, "c");
    renderMenu({ personalWork, clientWork });

    expect(screen.getByText(/p title 0/)).toBeInTheDocument();
    expect(screen.getByText(/p title 24/)).toBeInTheDocument();
    expect(screen.getByText(/c title 0/)).toBeInTheDocument();
    expect(screen.getByText(/c title 14/)).toBeInTheDocument();
  });

  it("shows empty-state placeholders when a section has no items", () => {
    renderMenu();
    expect(screen.getByText(/coming soon/)).toBeInTheDocument();
    expect(screen.getByText(/taking clients/)).toBeInTheDocument();
  });

  it("closes the menu when a nav link is clicked", () => {
    const { setIsOpen } = renderMenu();
    fireEvent.click(screen.getByRole("link", { name: /^HOME$/ }));
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("closes the menu when a work item is clicked", () => {
    const { setIsOpen } = renderMenu({ personalWork: makeWork(1, "p") });
    fireEvent.click(screen.getByRole("link", { name: /p title 0/ }));
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("closes the menu when the music link is clicked", () => {
    const { setIsOpen } = renderMenu();
    fireEvent.click(screen.getByRole("link", { name: /music/i }));
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it("renders draft work items with a [DRAFT] prefix and year", () => {
    const personalWork: WorkItem[] = [
      {
        id: "draft-1",
        slug: "draft-1",
        title: "wip piece",
        isDraft: true,
        isExternal: false,
        date: "2024-03-01",
      },
    ];
    renderMenu({ personalWork });
    const draftLink = screen.getByRole("link", { name: /draft.*2024.*wip piece/i });
    expect(draftLink).toBeInTheDocument();
    expect(within(draftLink).getByText(/2024/)).toBeInTheDocument();
  });
});
