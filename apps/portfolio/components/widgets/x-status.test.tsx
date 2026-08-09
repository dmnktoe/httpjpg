import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { XPost, XProfile } from "@/lib/integrations/x-posts";

import { XStatus } from "./x-status";

const profile: XProfile = {
  id: "10017528",
  username: "dmnktoe",
  name: "dmnk",
  avatar: "https://example.com/avatar.jpg",
  followerCount: 1234,
};

const post: XPost = {
  id: "5001591756625130239",
  text: "Hello world",
  url: "https://x.com/dmnktoe/status/5001591756625130239",
  createdAt: "2025-10-02T05:47:48.000Z",
  hasMedia: false,
  isSensitive: false,
  isQuote: false,
};

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("XStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("holds a loading label, then collapses when there is no post", async () => {
    mockFetch({ profile, posts: [] });
    const { container } = render(<XStatus />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders the avatar, the follower count and the latest post", async () => {
    mockFetch({ profile, posts: [post] });
    render(<XStatus />);

    expect(await screen.findByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("(1.2K)")).toBeInTheDocument();
    expect(document.querySelector(`img[src="${profile.avatar}"]`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", post.url);
  });

  it("compacts large follower counts and spells small ones out", async () => {
    mockFetch({ profile: { ...profile, followerCount: 226995885 }, posts: [post] });
    const { unmount } = render(<XStatus />);
    expect(await screen.findByText("(227M)")).toBeInTheDocument();
    unmount();

    mockFetch({ profile: { ...profile, followerCount: 42 }, posts: [post] });
    render(<XStatus />);
    expect(await screen.findByText("(42)")).toBeInTheDocument();
  });

  it("reveals the handle in a tooltip when the avatar is hovered", async () => {
    mockFetch({ profile, posts: [post] });
    render(<XStatus />);

    await screen.findByText("Hello world");
    const avatar = document.querySelector(`img[src="${profile.avatar}"]`) as HTMLElement;
    const trigger = avatar.parentElement as HTMLElement;

    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toContain("@dmnktoe");
    expect(trigger).toHaveAttribute("tabindex", "0");

    fireEvent.mouseEnter(trigger);

    expect(screen.getByRole("tooltip")).toHaveAttribute("aria-hidden", "false");
    expect(trigger.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip").id);
  });

  it("labels the follower count with the exact number for screen readers", async () => {
    mockFetch({ profile, posts: [post] });
    render(<XStatus />);

    expect(await screen.findByLabelText("1234 followers")).toBeInTheDocument();
  });

  it("omits the follower count when the API did not report one", async () => {
    mockFetch({ profile: { ...profile, followerCount: null }, posts: [post] });
    render(<XStatus />);

    await screen.findByText("Hello world");
    expect(screen.queryByText(/^\(/)).not.toBeInTheDocument();
  });

  it("renders without an avatar when the profile has none", async () => {
    mockFetch({ profile: { ...profile, avatar: null }, posts: [post] });
    render(<XStatus />);

    await screen.findByText("Hello world");
    expect(document.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("(1.2K)")).toBeInTheDocument();
  });

  it("marks quote posts and posts with media", async () => {
    mockFetch({ profile, posts: [{ ...post, isQuote: true, hasMedia: true }] });
    render(<XStatus />);

    expect(await screen.findByLabelText("quote post")).toBeInTheDocument();
    expect(screen.getByLabelText("has media")).toBeInTheDocument();
  });

  it("omits the markers for a plain text post", async () => {
    mockFetch({ profile, posts: [post] });
    render(<XStatus />);

    await screen.findByText("Hello world");
    expect(screen.queryByLabelText("quote post")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("has media")).not.toBeInTheDocument();
  });

  it("keeps the line unbreakable, letting only the post ellipsize", async () => {
    mockFetch({ profile, posts: [{ ...post, isQuote: true, hasMedia: true }] });
    render(<XStatus />);

    expect(await screen.findByText("Hello world")).toHaveClass("min-w_0");
    expect(screen.getByText("(1.2K)")).toHaveClass("flex-sh_0");
    expect(screen.getByLabelText("quote post")).toHaveClass("flex-sh_0");
    expect(screen.getByLabelText("has media")).toHaveClass("flex-sh_0");

    const avatar = document.querySelector(`img[src="${profile.avatar}"]`) as HTMLElement;
    expect(avatar.parentElement?.parentElement).toHaveClass("flex-sh_0");
  });

  it("collapses when the payload carries a post but no profile", async () => {
    mockFetch({ posts: [post] });
    const { container } = render(<XStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<XStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(<XStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
