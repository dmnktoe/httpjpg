import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/components/feed/feed-composer", () => ({
  FeedComposer: ({ slug }: { slug?: string }) => <div data-testid="composer">{slug ?? "new"}</div>,
}));

import UploadPage, { instant, metadata } from "./page";

async function renderPage(post?: string | string[]) {
  render(await UploadPage({ searchParams: Promise.resolve(post === undefined ? {} : { post }) }));
}

describe("UploadPage", () => {
  it("writes a new post by default", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("new post");
    expect(screen.getByTestId("composer")).toHaveTextContent("new");
  });

  it("edits the post it is given", async () => {
    await renderPage("20261125-153012-a3f9");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("edit post");
    expect(screen.getByTestId("composer")).toHaveTextContent("20261125-153012-a3f9");
  });

  it.each([["../config"], [["a", "b"]]])("ignores %s as a post", async (post) => {
    await renderPage(post);

    expect(screen.getByTestId("composer")).toHaveTextContent("new");
  });

  it("stays out of search engines and blocks like the root layout", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(instant).toBe(false);
  });
});
