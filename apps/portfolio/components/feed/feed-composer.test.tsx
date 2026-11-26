import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/feed/compose/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/feed/compose/api")>()),
  hasSession: vi.fn(),
  loadPost: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("./composer-editor", () => ({
  ComposerEditor: ({ post }: { post?: { slug: string } }) => (
    <div data-testid="editor">{post ? `editing ${post.slug}` : "new post"}</div>
  ),
}));

vi.mock("./feed-sign-in", () => ({
  FeedSignIn: ({ onSignedIn }: { onSignedIn: () => void }) => (
    <button type="button" onClick={onSignedIn}>
      stub sign in
    </button>
  ),
}));

import { ComposerApiError, hasSession, loadPost, signOut } from "@/lib/feed/compose/api";

import { FeedComposer } from "./feed-composer";

beforeEach(() => {
  vi.mocked(hasSession).mockReset().mockResolvedValue(true);
  vi.mocked(loadPost).mockReset();
  vi.mocked(signOut).mockReset().mockResolvedValue(undefined);
});

describe("FeedComposer", () => {
  it("asks for the token when the browser has no session", async () => {
    vi.mocked(hasSession).mockResolvedValue(false);
    render(<FeedComposer />);

    expect(screen.getByText(/one moment/)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "stub sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "[ sign out ]" })).toBeNull();
  });

  it("treats a failed check as signed out", async () => {
    vi.mocked(hasSession).mockRejectedValue(new Error("offline"));
    render(<FeedComposer />);

    expect(await screen.findByRole("button", { name: "stub sign in" })).toBeInTheDocument();
  });

  it("opens the editor for a new post once signed in", async () => {
    vi.mocked(hasSession).mockResolvedValue(false);
    render(<FeedComposer />);

    fireEvent.click(await screen.findByRole("button", { name: "stub sign in" }));

    expect(await screen.findByTestId("editor")).toHaveTextContent("new post");
    expect(loadPost).not.toHaveBeenCalled();
  });

  it("loads the post it is asked to edit", async () => {
    vi.mocked(loadPost).mockResolvedValue({ slug: "abc" } as never);
    render(<FeedComposer slug="abc" />);

    expect(await screen.findByTestId("editor")).toHaveTextContent("editing abc");
    expect(loadPost).toHaveBeenCalledWith("abc");
  });

  it("says so when that post is gone", async () => {
    vi.mocked(loadPost).mockRejectedValue(new ComposerApiError(404, "not found"));
    render(<FeedComposer slug="abc" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/does not exist/);
  });

  it("tells a failed load from a missing post", async () => {
    vi.mocked(loadPost).mockRejectedValue(new Error("offline"));
    render(<FeedComposer slug="abc" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be loaded/);
  });

  it("asks for the token again when the session has run out", async () => {
    vi.mocked(loadPost).mockRejectedValue(new ComposerApiError(401, "unauthorized"));
    render(<FeedComposer slug="abc" />);

    expect(await screen.findByRole("button", { name: "stub sign in" })).toBeInTheDocument();
  });

  it("signs out, also when the request fails", async () => {
    vi.mocked(signOut).mockRejectedValue(new Error("offline"));
    render(<FeedComposer />);

    fireEvent.click(await screen.findByRole("button", { name: "[ sign out ]" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "stub sign in" })).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: "[ ← feed ]" })).toHaveAttribute("href", "/feed");
  });
});
