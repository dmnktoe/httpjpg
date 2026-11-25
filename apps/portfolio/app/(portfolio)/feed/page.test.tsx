import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/queries/feed", () => ({
  getFeedPage: vi.fn(),
}));

vi.mock("@/components/ui/feed-stream", () => ({
  FeedStream: ({ initial }: { initial: { posts: unknown[] } }) => (
    <div data-testid="stream">{initial.posts.length} posts</div>
  ),
}));

import { getFeedPage } from "@/lib/queries/feed";

import FeedPage, { instant, metadata } from "./page";

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
  vi.mocked(getFeedPage).mockResolvedValue({
    posts: [{ id: "a", href: "/feed/a", content: { _uid: "a", component: "post" } }],
    page: 1,
    hasMore: false,
  });
});

describe("FeedPage", () => {
  it("renders the first page of the feed under a heading", async () => {
    render(await FeedPage());

    expect(getFeedPage).toHaveBeenCalledWith(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("feed");
    expect(screen.getByTestId("stream")).toHaveTextContent("1 posts");
  });

  it("resets the theme to light", async () => {
    document.documentElement.dataset.theme = "dark";

    render(await FeedPage());

    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("is canonical at /feed and blocks like the root layout", () => {
    expect(metadata.alternates).toEqual({ canonical: "/feed" });
    expect(metadata.title).toBe("feed");
    expect(instant).toBe(false);
  });
});
