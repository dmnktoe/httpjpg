import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CloudflareStatus } from "./cloudflare-status";

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CloudflareStatus", () => {
  it("renders the attribution line with the Cloudflare lockup", () => {
    mockFetch({ colo: null, country: null, threats: null, cachedRatio: null });
    render(<CloudflareStatus />);

    expect(screen.getByText("backed & secured by")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cloudflare" })).toBeInTheDocument();
  });

  it("links the whole line out to Cloudflare", () => {
    mockFetch({ colo: null, country: null, threats: null, cachedRatio: null });
    render(<CloudflareStatus />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://www.cloudflare.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps the lockup visible while the request is in flight", () => {
    let resolveFetch: ((value: { ok: boolean; json: () => Promise<unknown> }) => void) | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );

    render(<CloudflareStatus />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toBeInTheDocument();
    expect(screen.queryByText("FRA")).not.toBeInTheDocument();
    expect(resolveFetch).toBeDefined();
  });

  it("appends colo, country, blocked threats, and cache ratio", async () => {
    mockFetch({ colo: "FRA", country: "DE", threats: 1200, cachedRatio: 0.92 });
    render(<CloudflareStatus />);

    expect(await screen.findByText("FRA")).toBeInTheDocument();
    expect(screen.getByText("DE")).toBeInTheDocument();
    expect(screen.getByText("1.2K blocked")).toBeInTheDocument();
    expect(screen.getByText("92% cached")).toBeInTheDocument();
  });

  it("hides the attribution label and analytics extras below md", async () => {
    mockFetch({ colo: "FRA", country: "DE", threats: 23, cachedRatio: 0.03 });
    render(<CloudflareStatus />);

    expect(await screen.findByText("23 blocked")).toBeInTheDocument();
    expect(screen.getByText("backed & secured by")).toHaveClass("d_none", "md:d_block");
    expect(screen.getByText("23 blocked")).toHaveClass("d_none", "md:d_block");
    expect(screen.getByText("3% cached")).toHaveClass("d_none", "md:d_block");
    expect(screen.getByText("FRA")).not.toHaveClass("d_none");
    expect(screen.getByText("DE")).not.toHaveClass("d_none");
  });

  it("omits empty extras so a local request still reads as attribution", async () => {
    const fetchMock = mockFetch({
      colo: null,
      country: null,
      threats: 0,
      cachedRatio: null,
    });
    render(<CloudflareStatus />);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/cloudflare", expect.anything()),
    );
    expect(screen.getByText("backed & secured by")).toBeInTheDocument();
    expect(screen.queryByText(/blocked/)).not.toBeInTheDocument();
    expect(screen.queryByText(/cached/)).not.toBeInTheDocument();
  });
});
