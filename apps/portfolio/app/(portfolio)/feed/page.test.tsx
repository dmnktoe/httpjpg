import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/queries/feed", () => ({
  getFeedPage: vi.fn(),
}));

vi.mock("@/lib/queries/config", () => ({
  getAuthor: vi.fn(),
}));

vi.mock("@/components/ui/feed-stream", () => ({
  FeedStream: ({ initial }: { initial: { posts: unknown[] } }) => (
    <div data-testid="stream">{initial.posts.length} posts</div>
  ),
}));

import { getAuthor } from "@/lib/queries/config";
import { getFeedPage } from "@/lib/queries/feed";

import FeedPage, { instant, metadata } from "./page";

function feed(caption?: string) {
  return {
    posts: [{ id: "a", href: "/feed/a", content: { _uid: "a", component: "post", caption } }],
    page: 1,
    hasMore: true,
    total: 14,
  } as never;
}

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
  vi.mocked(getFeedPage).mockResolvedValue(feed("harbour dump"));
  vi.mocked(getAuthor).mockResolvedValue({ name: "httpjpg", avatar: "/me.jpg" });
});

describe("FeedPage", () => {
  it("renders the first page of the feed under its heading", async () => {
    render(await FeedPage());

    expect(getFeedPage).toHaveBeenCalledWith(1);
    expect(screen.getByRole("heading", { level: 1, name: /feed/ })).toHaveTextContent("httpGR▲M");
    expect(screen.getByTestId("stream")).toHaveTextContent("1 posts");
  });

  it("introduces the author with every post counted", async () => {
    const { container } = render(await FeedPage());

    expect(screen.getByText("httpjpg")).toBeInTheDocument();
    expect(container.querySelector("[data-avatar] img")).toHaveAttribute("src", "/me.jpg");
    expect(screen.getAllByRole("definition")[0]).toHaveTextContent("14");
  });

  it("leaves the profile out without an author", async () => {
    vi.mocked(getAuthor).mockResolvedValue(null);

    const { container } = render(await FeedPage());

    expect(container.querySelector("[data-avatar]")).toBeNull();
  });

  it("runs the captions past in a strip, when there are any", async () => {
    const withCaption = render(await FeedPage());
    expect(withCaption.container).toHaveTextContent("⋆ harbour dump");
    withCaption.unmount();

    vi.mocked(getFeedPage).mockResolvedValue(feed());
    const without = render(await FeedPage());
    expect(without.container).not.toHaveTextContent("⋆ ");
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
