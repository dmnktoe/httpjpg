import { PreviewBadgeBridge, resetPreviewBadgeStore } from "@httpjpg/ui";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let searchParamKeys: Set<string>;

vi.mock("next/navigation", () => ({
  usePathname: () => "/work/example",
  useSearchParams: () => ({
    has: (key: string) => searchParamKeys.has(key),
  }),
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
    resetPreviewBadgeStore();
  });

  afterEach(() => {
    cleanup();
    clearCookies();
    resetPreviewBadgeStore();
  });

  it("renders nothing outside of preview mode", () => {
    render(<PreviewNotification />);

    expect(screen.queryByRole("status", { name: /preview mode/i })).toBeNull();
    expect(document.body.querySelector("[data-page-badge]")).toBeNull();
  });

  it("renders the draft cluster when the draft-bypass cookie is present", () => {
    document.cookie = "__prerender_bypass=token";

    render(<PreviewNotification />);

    expect(screen.getByRole("status", { name: /preview mode/i })).toHaveTextContent("draft");
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
    expect(screen.getByRole("button", { name: "Show 12-column overlay (G)" })).not.toBeNull();
  });

  it("renders the cluster when the _storyblok query param is present", () => {
    searchParamKeys = new Set(["_storyblok"]);

    render(<PreviewNotification />);

    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
  });

  it("renders the cluster when the _draft query param is present", () => {
    searchParamKeys = new Set(["_draft"]);

    render(<PreviewNotification />);

    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
  });

  it("does not invent a preview pill when the work page has no live URL", () => {
    document.cookie = "__prerender_bypass=token";

    render(
      <>
        <PreviewNotification />
        <PreviewBadgeBridge editHref="https://app.storyblok.com/#/me/spaces/7/stories/0/0/9" />
      </>,
    );

    expect(screen.queryByRole("link", { name: /open external preview/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
  });

  it("folds page edit + preview href into the same cluster", () => {
    document.cookie = "__prerender_bypass=token";

    render(
      <>
        <PreviewNotification />
        <PreviewBadgeBridge
          previewHref="https://external.dev"
          editHref="https://app.storyblok.com/#/me/spaces/7/stories/0/0/9"
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
  });
});
