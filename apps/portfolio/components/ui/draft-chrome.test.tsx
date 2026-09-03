import { PageBadge, resetPageBadgeStore } from "@httpjpg/ui";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let searchParamKeys: Set<string>;

vi.mock("next/navigation", () => ({
  usePathname: () => "/work/example",
  useSearchParams: () => ({
    has: (key: string) => searchParamKeys.has(key),
  }),
}));

import { DraftChrome } from "./draft-chrome";

function clearCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

describe("DraftChrome", () => {
  beforeEach(() => {
    searchParamKeys = new Set();
    clearCookies();
    resetPageBadgeStore();
  });

  afterEach(() => {
    cleanup();
    clearCookies();
    resetPageBadgeStore();
  });

  it("renders nothing outside of draft mode", () => {
    render(<DraftChrome />);

    expect(screen.queryByRole("status", { name: /preview mode/i })).toBeNull();
    expect(document.body.querySelector("[data-page-badge]")).toBeNull();
  });

  it("renders draft chrome when the draft-bypass cookie is present", () => {
    document.cookie = "__prerender_bypass=token";

    render(<DraftChrome />);

    expect(screen.getByRole("status", { name: /preview mode/i })).toHaveTextContent("draft");
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
    expect(screen.getByRole("button", { name: "Show 12-column overlay (G)" })).not.toBeNull();
  });

  it("renders draft chrome when the _storyblok query param is present", () => {
    searchParamKeys = new Set(["_storyblok"]);

    render(<DraftChrome />);

    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
  });

  it("renders draft chrome when the _draft query param is present", () => {
    searchParamKeys = new Set(["_draft"]);

    render(<DraftChrome />);

    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
  });

  it("puts the work URL and editor pills in one cluster", () => {
    document.cookie = "__prerender_bypass=token";

    render(
      <>
        <DraftChrome />
        <PageBadge
          href="https://external.dev"
          editHref="https://app.storyblok.com/#/me/spaces/7/stories/0/0/9"
          accentColor="#ec6839"
        />
      </>,
    );

    expect(document.body.querySelectorAll("[data-page-badge]")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      "https://external.dev",
    );
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute(
      "href",
      "https://app.storyblok.com/#/me/spaces/7/stories/0/0/9",
    );
    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
    expect(
      screen
        .getByRole("link", { name: /open external preview/ })
        .style.getPropertyValue("--work-accent"),
    ).toBe("#EC6839");
    expect(
      screen.getByRole("status", { name: /preview mode/i }).style.getPropertyValue("--work-accent"),
    ).toBe("");
  });
});
