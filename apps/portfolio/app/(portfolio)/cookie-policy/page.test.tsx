vi.mock("@httpjpg/consent", () => ({
  CookieCenter: () => <div>cookie-center</div>,
  VendorList: () => <div>vendor-list</div>,
}));

import { render, screen } from "@testing-library/react";

import CookiePolicyPage from "./page";

describe("CookiePolicyPage", () => {
  it("renders the policy copy and preference widgets", () => {
    render(<CookiePolicyPage />);
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
    expect(screen.getByText("cookie-center")).toBeInTheDocument();
    expect(screen.getByText("vendor-list")).toBeInTheDocument();
  });
});
