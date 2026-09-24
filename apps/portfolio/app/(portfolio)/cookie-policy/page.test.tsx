vi.mock("@httpjpg/consent", async () => {
  const actual = await vi.importActual<typeof import("@httpjpg/consent")>("@httpjpg/consent");
  return {
    ...actual,
    CookieCenter: () => <div>cookie-center</div>,
    VendorList: () => <div>vendor-list</div>,
  };
});

import { render, screen } from "@testing-library/react";

import CookiePolicyPage from "./page";

describe("CookiePolicyPage", () => {
  it("renders the policy copy and preference widgets", () => {
    render(<CookiePolicyPage />);
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
    expect(screen.getByText("cookie-center")).toBeInTheDocument();
    expect(screen.getByText("vendor-list")).toBeInTheDocument();
    expect(screen.getAllByText(/cookiedatabase\.org/).length).toBeGreaterThan(0);
    expect(screen.getByText(/httpjpg_consent/)).toBeInTheDocument();
  });

  it("lets Link render a single external glyph on Cookie Database entries", () => {
    render(<CookiePolicyPage />);
    const links = screen.getAllByRole("link", { name: "Cookie Database" });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.textContent).toBe("Cookie Database↗");
      expect(link.querySelectorAll("[aria-hidden='true']")).toHaveLength(1);
    }
  });
});
