import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockFooterProps {
  showVersion?: boolean;
  version?: string;
  versionHref?: string;
  lastUpdated?: string;
  widgets?: React.ReactNode;
  copyrightText?: string;
  footerLinks?: unknown;
  onCookieSettingsClick?: unknown;
  backgroundImage?: string;
}

interface MockBoxProps {
  as?: string;
  css?: unknown;
  children?: React.ReactNode;
  [key: string]: unknown;
}

vi.mock("@httpjpg/ui", () => {
  const React = require("react");
  return {
    ASCII_DIVIDER_WAVE: "~~~",
    AsciiArt: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Box: React.forwardRef(({ as: Tag = "div", css: _css, ...rest }: MockBoxProps, ref: unknown) =>
      React.createElement(Tag as string, { ...rest, ref }),
    ),
    Footer: ({
      showVersion,
      version,
      versionHref,
      lastUpdated,
      widgets,
      copyrightText,
    }: MockFooterProps) => (
      <footer>
        {copyrightText && <span>{copyrightText}</span>}
        {widgets}
        {showVersion && (
          <span data-testid="version-block">
            {lastUpdated && <span>{lastUpdated}</span>}
            {versionHref ? <a href={versionHref}>{version}</a> : <span>{version || "v-dev"}</span>}
          </span>
        )}
      </footer>
    ),
  };
});

vi.mock("@/components/widgets/discord-status", () => ({
  DiscordStatus: () => <div data-testid="discord-status" />,
}));

vi.mock("@/components/widgets/flag-counter", () => ({
  FlagCounter: () => <div data-testid="flag-counter" />,
}));

import { FooterWrapper } from "./footer-wrapper";

describe("FooterWrapper", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("formats a semver version with v prefix", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "1.3.0");
    render(<FooterWrapper />);
    expect(screen.getByRole("link", { name: "v1.3.0" })).toBeInTheDocument();
  });

  it("keeps existing v prefix", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "v2.0.0");
    render(<FooterWrapper />);
    expect(screen.getByRole("link", { name: "v2.0.0" })).toBeInTheDocument();
  });

  it("truncates non-semver values to 7-char hash", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "abc1234def5678");
    render(<FooterWrapper />);
    expect(screen.getByRole("link", { name: "vabc1234" })).toBeInTheDocument();
  });

  it("links version to the correct GitHub release URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "1.3.0");
    render(<FooterWrapper />);
    const link = screen.getByRole("link", { name: "v1.3.0" });
    expect(link).toHaveAttribute("href", "https://github.com/dmnktoe/httpjpg/releases/tag/v1.3.0");
  });

  it("does not render version when env var is missing", () => {
    render(<FooterWrapper />);
    expect(screen.queryByTestId("version-block")).not.toBeInTheDocument();
  });

  it("formats and passes lastUpdated", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "1.0.0");
    render(<FooterWrapper lastUpdated="2026-05-27T12:00:00Z" />);
    expect(screen.getByText("last updated 2026-05-27")).toBeInTheDocument();
  });

  it("renders widgets (discord status and flag counter)", () => {
    render(<FooterWrapper />);
    expect(screen.getByTestId("discord-status")).toBeInTheDocument();
    expect(screen.getByTestId("flag-counter")).toBeInTheDocument();
  });
});
