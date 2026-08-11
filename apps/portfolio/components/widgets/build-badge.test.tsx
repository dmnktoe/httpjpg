import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BuildBadge } from "./build-badge";

const NOW = Date.parse("2026-08-08T12:00:00Z");
const REPO = "https://github.com/dmnktoe/httpjpg";

describe("BuildBadge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders nothing without any build information", () => {
    const { container } = render(<BuildBadge repositoryUrl={REPO} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the version, the short sha and the deploy age", () => {
    render(
      <BuildBadge
        repositoryUrl={REPO}
        version="v2.4.0"
        commitSha="a1b2c3d4e5f6a7b8"
        buildTime="2026-08-08T09:00:00Z"
      />,
    );

    expect(screen.getByText("v2.4.0")).toBeInTheDocument();
    expect(screen.getByText("a1b2c3d")).toBeInTheDocument();
    expect(screen.getByText("deployed 3h ago")).toBeInTheDocument();
  });

  it("links to the commit when a sha is known", () => {
    render(<BuildBadge repositoryUrl={REPO} version="v2.4.0" commitSha="a1b2c3d4e5f6a7b8" />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/dmnktoe/httpjpg/commit/a1b2c3d4e5f6a7b8",
    );
  });

  it("falls back to the release tag when only the version is known", () => {
    render(<BuildBadge repositoryUrl={REPO} version="v2.4.0" />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/dmnktoe/httpjpg/releases/tag/v2.4.0",
    );
  });

  it("renders an unlinked line when only the build time is known", () => {
    render(<BuildBadge repositoryUrl={REPO} buildTime="2026-08-08T11:00:00Z" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("build:")).toBeInTheDocument();
  });

  it("points the link at the configured repository", () => {
    render(<BuildBadge repositoryUrl="https://github.com/acme/site" version="v1.0.0" />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://github.com/acme/site/releases/tag/v1.0.0",
    );
  });

  it("renders the version unlinked when no repository is configured", () => {
    render(<BuildBadge version="v2.4.0" commitSha="a1b2c3d4e5f6a7b8" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("v2.4.0")).toBeInTheDocument();
  });

  it("omits the deploy age when the build time is unparseable", () => {
    render(<BuildBadge repositoryUrl={REPO} version="v2.4.0" buildTime="not-a-date" />);

    expect(screen.queryByText(/deployed/)).not.toBeInTheDocument();
  });
});
