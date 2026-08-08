import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { XPost, XProfile } from "@/lib/integrations/x-posts";

import { XStatus } from "./x-status";

const profile: XProfile = {
  id: "10017528",
  username: "dmnktoe",
  name: "dmnk",
  avatar: "https://example.com/avatar.jpg",
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
  });

  it("holds a loading label, then collapses when there is no post", async () => {
    mockFetch({ profile, posts: [] });
    const { container } = render(<XStatus />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders the latest post with the handle and avatar", async () => {
    mockFetch({ profile, posts: [post] });
    render(<XStatus />);

    expect(await screen.findByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("@dmnktoe")).toBeInTheDocument();
    expect(document.querySelector(`img[src="${profile.avatar}"]`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", post.url);
  });

  it("renders without an avatar when the profile has none", async () => {
    mockFetch({ profile: { ...profile, avatar: null }, posts: [post] });
    render(<XStatus />);

    await screen.findByText("Hello world");
    expect(document.querySelector("img")).not.toBeInTheDocument();
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
