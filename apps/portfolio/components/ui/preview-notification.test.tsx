import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let searchParamKeys: Set<string>;

vi.mock("next/navigation", () => ({
  usePathname: () => "/work/example",
  useSearchParams: () => ({
    has: (key: string) => searchParamKeys.has(key),
  }),
}));

vi.mock("@httpjpg/ui", () => ({
  Box: ({ as, children, ...rest }: { as?: string; children?: ReactNode; href?: string }) =>
    createElement(as ?? "div", rest, children),
}));

import { PreviewNotification } from "./preview-notification";

function clearCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

describe("PreviewNotification", () => {
  beforeEach(() => {
    searchParamKeys = new Set();
    clearCookies();
  });

  afterEach(() => {
    cleanup();
    clearCookies();
  });

  it("renders nothing outside of preview mode", () => {
    render(<PreviewNotification />);

    expect(screen.queryByText(/Preview Mode aktiv/)).toBeNull();
  });

  it("renders the badge when the draft-bypass cookie is present", () => {
    document.cookie = "__prerender_bypass=token";

    render(<PreviewNotification />);

    expect(screen.getByText(/Preview Mode aktiv/)).toBeInTheDocument();
    expect(screen.getByText("Beenden")).toHaveAttribute("href", "/api/exit-draft");
  });

  it("renders the badge when the _storyblok query param is present", () => {
    searchParamKeys = new Set(["_storyblok"]);

    render(<PreviewNotification />);

    expect(screen.getByText(/Preview Mode aktiv/)).toBeInTheDocument();
  });

  it("renders the badge when the _draft query param is present", () => {
    searchParamKeys = new Set(["_draft"]);

    render(<PreviewNotification />);

    expect(screen.getByText(/Preview Mode aktiv/)).toBeInTheDocument();
  });
});
