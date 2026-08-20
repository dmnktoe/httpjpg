import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

afterEach(cleanup);

describe("XStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<XStatus profile={null} post={null} loaded={false} />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("collapses once loaded with no post", () => {
    const { container } = render(<XStatus profile={profile} post={null} loaded />);

    expect(container).toBeEmptyDOMElement();
  });

  it("collapses when there is a post but no profile", () => {
    const { container } = render(<XStatus profile={null} post={post} loaded />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the avatar, the follower count and the latest post", () => {
    render(<XStatus profile={profile} post={post} loaded />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("(1.2K)")).toBeInTheDocument();
    expect(document.querySelector(`img[src="${profile.avatar}"]`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", post.url);
  });

  it("compacts large follower counts and spells small ones out", () => {
    const { unmount } = render(
      <XStatus profile={{ ...profile, followerCount: 226995885 }} post={post} loaded />,
    );
    expect(screen.getByText("(227M)")).toBeInTheDocument();
    unmount();

    render(<XStatus profile={{ ...profile, followerCount: 42 }} post={post} loaded />);
    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("reveals the handle in a tooltip when the avatar is hovered", () => {
    render(<XStatus profile={profile} post={post} loaded />);

    const avatar = document.querySelector(`img[src="${profile.avatar}"]`) as HTMLElement;
    const trigger = avatar.parentElement as HTMLElement;

    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toContain("@dmnktoe");
    expect(trigger).toHaveAttribute("tabindex", "0");

    fireEvent.mouseEnter(trigger);

    expect(screen.getByRole("tooltip")).toHaveAttribute("aria-hidden", "false");
    expect(trigger.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip").id);
  });

  it("labels the follower count with the exact number for screen readers", () => {
    render(<XStatus profile={profile} post={post} loaded />);

    expect(screen.getByLabelText("1234 followers")).toBeInTheDocument();
  });

  it("omits the follower count when the API did not report one", () => {
    render(<XStatus profile={{ ...profile, followerCount: null }} post={post} loaded />);

    expect(screen.queryByText(/^\(/)).not.toBeInTheDocument();
  });

  it("renders without an avatar when the profile has none", () => {
    render(<XStatus profile={{ ...profile, avatar: null }} post={post} loaded />);

    expect(document.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("(1.2K)")).toBeInTheDocument();
  });

  it("marks quote posts and posts with media", () => {
    render(<XStatus profile={profile} post={{ ...post, isQuote: true, hasMedia: true }} loaded />);

    expect(screen.getByLabelText("quote post")).toBeInTheDocument();
    expect(screen.getByLabelText("has media")).toBeInTheDocument();
  });

  it("omits the markers for a plain text post", () => {
    render(<XStatus profile={profile} post={post} loaded />);

    expect(screen.queryByLabelText("quote post")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("has media")).not.toBeInTheDocument();
  });

  it("keeps the line unbreakable, letting only the post ellipsize", () => {
    render(<XStatus profile={profile} post={{ ...post, isQuote: true, hasMedia: true }} loaded />);

    expect(screen.getByText("Hello world")).toHaveClass("min-w_0");
    expect(screen.getByText("(1.2K)")).toHaveClass("flex-sh_0");
    expect(screen.getByLabelText("quote post")).toHaveClass("flex-sh_0");
    expect(screen.getByLabelText("has media")).toHaveClass("flex-sh_0");

    const avatar = document.querySelector(`img[src="${profile.avatar}"]`) as HTMLElement;
    expect(avatar.parentElement?.parentElement).toHaveClass("flex-sh_0");
  });
});
