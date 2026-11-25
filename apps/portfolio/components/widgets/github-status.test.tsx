import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { GithubActivity, GithubProfile } from "@/lib/integrations/github";

const { trackOutboundClick } = vi.hoisted(() => ({ trackOutboundClick: vi.fn() }));
vi.mock("@httpjpg/analytics", () => ({ trackOutboundClick }));

import { GithubStatus } from "./github-status";

const profile: GithubProfile = {
  login: "dmnktoe",
  avatar: "https://example.com/avatar.png",
  url: "https://github.com/dmnktoe",
};

const push: GithubActivity = {
  kind: "push",
  verb: "pushed to",
  repo: "dmnktoe/httpjpg",
  detail: "main",
  url: "https://github.com/dmnktoe/httpjpg/commit/abc123",
  createdAt: "2026-11-24T12:00:00Z",
};

afterEach(cleanup);

describe("GithubStatus", () => {
  it("holds a loading label, then collapses without activity", () => {
    const { rerender, container } = render(
      <GithubStatus profile={null} activity={null} loaded={false} />,
    );
    expect(screen.getByText("loading ...")).toBeInTheDocument();

    rerender(<GithubStatus profile={profile} activity={null} loaded />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links the latest activity with verb, repo and branch", () => {
    render(<GithubStatus profile={profile} activity={push} loaded />);

    expect(screen.getByRole("link")).toHaveAttribute("href", push.url);
    expect(screen.getByText("pushed to")).toBeInTheDocument();
    expect(screen.getByText("dmnktoe/httpjpg")).toHaveClass("jpg-min-w_0");
    expect(screen.getByText("main")).toHaveClass("jpg-flex-sh_0");

    screen.getByRole("link").click();
    expect(trackOutboundClick).toHaveBeenCalledWith({
      destination: "github",
      href: push.url,
      label: "pushed to dmnktoe/httpjpg",
    });
  });

  it("leaves out the detail when the event has none", () => {
    render(
      <GithubStatus
        profile={profile}
        activity={{ ...push, kind: "star", verb: "starred", detail: null }}
        loaded
      />,
    );

    expect(screen.getByText("starred")).toBeInTheDocument();
    expect(screen.queryByText("main")).not.toBeInTheDocument();
  });
});
