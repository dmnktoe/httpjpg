import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/ui", () => ({
  CONSOLE_BANNER: "BANNER_ART",
}));

import { ConsoleBanner } from "./console-banner";

declare global {
  interface Window {
    __httpjpgBannerLogged?: boolean;
  }
}

describe("ConsoleBanner", () => {
  beforeEach(() => {
    delete window.__httpjpgBannerLogged;
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing", () => {
    const { container } = render(<ConsoleBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("logs the banner and marks the window flag", () => {
    render(<ConsoleBanner />);

    expect(window.__httpjpgBannerLogged).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("BANNER_ART"),
      expect.any(String),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("github.com/dmnktoe/httpjpg"),
      expect.any(String),
    );
  });

  it("only logs once even across multiple mounts", () => {
    render(<ConsoleBanner />);
    const callsAfterFirst = (console.log as ReturnType<typeof vi.fn>).mock.calls.length;

    cleanup();
    render(<ConsoleBanner />);

    expect((console.log as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirst);
  });
});
