import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import type { FeedPage, FeedPostEntry } from "@/lib/queries/feed";

import { FeedStream } from "./feed-stream";

const fetchMock = vi.fn();

function entry(id: string): FeedPostEntry {
  return {
    id,
    href: `/feed/${id}`,
    content: {
      _uid: id,
      component: "post",
      caption: `caption ${id}`,
      images: [
        {
          _uid: `img-${id}`,
          component: "post_image",
          image: {
            filename: `https://a.storyblok.com/f/1/800x800/abc/${id}.jpg`,
            alt: `photo ${id}`,
          },
        },
      ],
    },
  };
}

function feed(ids: string[], page = 1, hasMore = false): FeedPage {
  return { posts: ids.map(entry), page, hasMore };
}

function ok(body: FeedPage): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("FeedStream", () => {
  it("says so when the feed is empty", () => {
    render(<FeedStream initial={feed([])} />);

    expect(screen.getByText(/nothing here yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /load more/ })).toBeNull();
  });

  it("renders the server's posts with their permalinks", () => {
    render(<FeedStream initial={feed(["a", "b"])} />);

    expect(screen.getByAltText("photo a")).toBeInTheDocument();
    expect(screen.getByText("caption b")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /load more/ })).toBeNull();
  });

  it("appends the next page and skips posts it already shows", async () => {
    fetchMock.mockResolvedValue(ok(feed(["b", "c"], 2, false)));
    render(<FeedStream initial={feed(["a", "b"], 1, true)} />);

    fireEvent.click(screen.getByRole("button", { name: "[ load more ]" }));

    await waitFor(() => expect(screen.getByAltText("photo c")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith("/api/feed/posts?page=2");
    expect(screen.getAllByAltText("photo b")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /load more/ })).toBeNull();
  });

  it("keeps paging while more follows", async () => {
    fetchMock
      .mockResolvedValueOnce(ok(feed(["b"], 2, true)))
      .mockResolvedValueOnce(ok(feed(["c"], 3, false)));
    render(<FeedStream initial={feed(["a"], 1, true)} />);

    fireEvent.click(screen.getByRole("button", { name: "[ load more ]" }));
    await waitFor(() => expect(screen.getByAltText("photo b")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "[ load more ]" }));
    await waitFor(() => expect(screen.getByAltText("photo c")).toBeInTheDocument());

    expect(fetchMock).toHaveBeenLastCalledWith("/api/feed/posts?page=3");
  });

  it("disables the button while a page loads", async () => {
    let resolve: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((done) => (resolve = done)));
    render(<FeedStream initial={feed(["a"], 1, true)} />);

    fireEvent.click(screen.getByRole("button", { name: "[ load more ]" }));

    expect(screen.getByRole("button", { name: "[ loading … ]" })).toBeDisabled();
    resolve(ok(feed(["b"], 2, false)));
    await waitFor(() => expect(screen.getByAltText("photo b")).toBeInTheDocument());
  });

  it.each([
    ["an error status", () => Promise.resolve(new Response("nope", { status: 500 }))],
    ["a network failure", () => Promise.reject(new Error("offline"))],
    ["a page that came back empty", () => Promise.resolve(ok(feed([], 2, false)))],
  ])("offers a retry after %s", async (_label, respond) => {
    fetchMock.mockImplementationOnce(respond).mockResolvedValueOnce(ok(feed(["b"], 2, false)));
    render(<FeedStream initial={feed(["a"], 1, true)} />);

    fireEvent.click(screen.getByRole("button", { name: "[ load more ]" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not load more/);

    fireEvent.click(screen.getByRole("button", { name: "[ load more ]" }));
    await waitFor(() => expect(screen.getByAltText("photo b")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenLastCalledWith("/api/feed/posts?page=2");
  });
});
