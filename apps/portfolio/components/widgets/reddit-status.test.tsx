import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { trackOutboundClick } = vi.hoisted(() => ({ trackOutboundClick: vi.fn() }));
vi.mock("@httpjpg/analytics", () => ({ trackOutboundClick }));

import { RedditStatus } from "./reddit-status";

const reddit = { username: "dmnktoe", karma: 12345, url: "https://www.reddit.com/user/dmnktoe/" };

afterEach(cleanup);

describe("RedditStatus", () => {
  it("holds a loading label, then collapses without data", () => {
    const { rerender, container } = render(<RedditStatus reddit={null} loaded={false} />);
    expect(screen.getByText("loading ...")).toBeInTheDocument();

    rerender(<RedditStatus reddit={null} loaded />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links the profile with the compacted karma", () => {
    render(<RedditStatus reddit={reddit} loaded />);

    expect(screen.getByRole("link")).toHaveAttribute("href", reddit.url);
    expect(screen.getByText("u/dmnktoe")).toBeInTheDocument();
    expect(screen.getByLabelText("12345 karma")).toHaveTextContent("12.3K karma");
    expect(screen.getByLabelText("12345 karma")).toHaveClass("jpg-flex-sh_0");

    screen.getByRole("link").click();
    expect(trackOutboundClick).toHaveBeenCalledWith({
      destination: "reddit",
      href: reddit.url,
      label: "u/dmnktoe",
    });
  });
});
