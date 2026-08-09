import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

const mockPathname = vi.fn<() => string>(() => "/");
vi.mock("next/navigation", () => ({ usePathname: () => mockPathname() }));

import { Header, type NavItem } from "./header";

const NAV: NavItem[] = [
  { name: "work", href: "/work" },
  { name: "about", href: "/about" },
];

interface MediaQueryStub {
  matches: boolean;
  media: string;
  listeners: Set<(event: MediaQueryListEvent) => void>;
  addEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => void;
  removeEventListener: (type: string, listener: (event: MediaQueryListEvent) => void) => void;
}

let mediaQuery: MediaQueryStub;
let scrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockPathname.mockReturnValue("/");
  scrollTo = vi.fn();
  vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("scrollY", 0);
  mediaQuery = {
    matches: false,
    media: "(min-width: 1024px)",
    listeners: new Set(),
    addEventListener: (_type, listener) => mediaQuery.listeners.add(listener),
    removeEventListener: (_type, listener) => mediaQuery.listeners.delete(listener),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.removeAttribute("style");
});

function openMenu() {
  fireEvent.click(screen.getByLabelText("Open menu"));
}

describe("Header", () => {
  it("renders the nav items and the site link", () => {
    render(<Header nav={NAV} />);

    expect(screen.getAllByRole("link", { name: "www.httpjpg.com" })[0]).toBeInTheDocument();
    expect(document.querySelectorAll('a[href="/work"]').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('a[href="/about"]').length).toBeGreaterThan(0);
  });

  it("renders extra children below the navigation", () => {
    render(
      <Header nav={NAV}>
        <span data-testid="extra" />
      </Header>,
    );

    expect(screen.getByTestId("extra")).toBeInTheDocument();
  });

  it("starts with the mobile menu closed", () => {
    render(<Header nav={NAV} />);

    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("opens the mobile menu and pins the body so iOS cannot pan the page", () => {
    vi.stubGlobal("scrollY", 240);
    render(<Header nav={NAV} />);

    openMenu();

    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-240px");
  });

  it("closes the mobile menu again on a second press and restores the scroll offset", () => {
    vi.stubGlobal("scrollY", 240);
    render(<Header nav={NAV} />);

    openMenu();
    fireEvent.click(screen.getByLabelText("Close menu"));

    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(0, 240);
  });

  it("closes the mobile menu when the route changes", () => {
    const { rerender } = render(<Header nav={NAV} />);
    openMenu();

    mockPathname.mockReturnValue("/work");
    rerender(<Header nav={NAV} />);

    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("closes the mobile menu when the viewport grows past the desktop breakpoint", () => {
    render(<Header nav={NAV} />);
    openMenu();

    act(() => {
      for (const listener of mediaQuery.listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("keeps the mobile menu open while the viewport stays narrow", () => {
    render(<Header nav={NAV} />);
    openMenu();

    act(() => {
      for (const listener of mediaQuery.listeners) {
        listener({ matches: false } as MediaQueryListEvent);
      }
    });

    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });

  it("detaches its media query listener on unmount", () => {
    const { unmount } = render(<Header nav={NAV} />);
    expect(mediaQuery.listeners.size).toBe(1);

    unmount();

    expect(mediaQuery.listeners.size).toBe(0);
  });

  it("restores body scroll on unmount", () => {
    const { unmount } = render(<Header nav={NAV} />);
    openMenu();

    unmount();

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });

  it("passes the work lists down to the navigation", () => {
    render(
      <Header
        nav={NAV}
        projectsWork={[{ id: "1", slug: "alpha", title: "Alpha" }]}
        websitesWork={[{ id: "2", slug: "beta", title: "Beta" }]}
      />,
    );

    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Beta").length).toBeGreaterThan(0);
  });

  it("hides the search trigger by default", () => {
    render(<Header nav={NAV} />);

    expect(screen.queryByRole("button", { name: "Open search" })).not.toBeInTheDocument();
  });

  it("renders the search trigger when asked to", () => {
    render(<Header nav={NAV} showSearch />);

    expect(screen.getAllByRole("button", { name: "Open search" }).length).toBeGreaterThan(0);
  });
});
