import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MastodonPost } from "@/lib/integrations/mastodon";

import { MastodonStatus } from "./mastodon-status";

const post: MastodonPost = {
  text: "Hello world",
  url: "https://mastodon.social/@dmnk/1",
  createdAt: "2026-08-01T10:00:00.000Z",
  hasMedia: false,
  isSensitive: false,
};

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("MastodonStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("holds a loading label, then collapses when there is no post", async () => {
    mockFetch({ posts: [] });
    const { container } = render(<MastodonStatus />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders the latest post linking to the status", async () => {
    mockFetch({ posts: [post] });
    render(<MastodonStatus />);

    expect(await screen.findByText("Hello world")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", post.url);
  });

  it("marks a post that carries media", async () => {
    mockFetch({ posts: [{ ...post, hasMedia: true }] });
    render(<MastodonStatus />);

    expect(await screen.findByLabelText("has media")).toBeInTheDocument();
  });

  it("omits the media marker for a text-only post", async () => {
    mockFetch({ posts: [post] });
    render(<MastodonStatus />);

    await screen.findByText("Hello world");
    expect(screen.queryByLabelText("has media")).not.toBeInTheDocument();
  });

  it("renders nothing when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<MastodonStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(<MastodonStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
