import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const extractVibrantColor = vi.hoisted(() => vi.fn());

vi.mock("@httpjpg/spotify", () => ({
  extractVibrantColor,
}));

import { AccentSync } from "./accent-sync";

describe("AccentSync", () => {
  afterEach(() => {
    cleanup();
    extractVibrantColor.mockReset();
    document.documentElement.style.removeProperty("--page-accent");
    document.documentElement.style.removeProperty("--page-accent-fg");
  });

  it("renders nothing", () => {
    extractVibrantColor.mockResolvedValue(null);
    const { container } = render(<AccentSync imageUrl="https://example.com/a.jpg" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("writes accent CSS variables from the extracted colour", async () => {
    extractVibrantColor.mockResolvedValue({
      css: "rgb(10, 20, 30)",
      textColor: "#ffffff",
      withAlpha: (alpha: number) => `rgba(10, 20, 30, ${alpha})`,
    });

    render(<AccentSync imageUrl="https://a.storyblok.com/f/1/cover.jpg" />);

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--page-accent")).toBe(
        "rgb(10, 20, 30)",
      );
    });
    expect(document.documentElement.style.getPropertyValue("--page-accent-fg")).toBe("#ffffff");
    expect(extractVibrantColor).toHaveBeenCalledWith("https://a.storyblok.com/f/1/cover.jpg");
  });

  it("clears accent variables when imageUrl is omitted", async () => {
    document.documentElement.style.setProperty("--page-accent", "rgb(1, 2, 3)");

    render(<AccentSync />);

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--page-accent")).toBe("");
    });
    expect(extractVibrantColor).not.toHaveBeenCalled();
  });

  it("clears accent variables on unmount", async () => {
    extractVibrantColor.mockResolvedValue({
      css: "rgb(10, 20, 30)",
      textColor: "#000000",
      withAlpha: () => "rgba(10, 20, 30, 0.5)",
    });

    const { unmount } = render(<AccentSync imageUrl="https://a.storyblok.com/f/1/cover.jpg" />);

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--page-accent")).toBe(
        "rgb(10, 20, 30)",
      );
    });

    unmount();

    expect(document.documentElement.style.getPropertyValue("--page-accent")).toBe("");
  });
});
