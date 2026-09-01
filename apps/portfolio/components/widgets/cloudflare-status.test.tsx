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

function follows(earlier: Node, later: Node): boolean {
  return (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
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
  it("renders the Cloudflare lockup", () => {
    mockFetch({ colo: null, country: null, threats: null, cachedRatio: null });
    render(<CloudflareStatus />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toBeInTheDocument();
    expect(screen.queryByText(/backed & secured/)).not.toBeInTheDocument();
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

  it("places the lockup between location and analytics extras", async () => {
    mockFetch({ colo: "FRA", country: "DE", threats: 1200, cachedRatio: 0.92 });
    render(<CloudflareStatus />);

    const logo = await screen.findByRole("img", { name: "Cloudflare" });
    const colo = screen.getByText("FRA");
    const country = screen.getByText("DE");
    const blocked = screen.getByText("1.2K blocked");
    const cached = screen.getByText("92% cached");

    expect(follows(colo, country)).toBe(true);
    expect(follows(country, logo)).toBe(true);
    expect(follows(logo, blocked)).toBe(true);
    expect(follows(blocked, cached)).toBe(true);
  });

  it("hides the analytics extras below md", async () => {
    mockFetch({ colo: "FRA", country: "DE", threats: 23, cachedRatio: 0.03 });
    render(<CloudflareStatus />);

    expect(await screen.findByText("23 blocked")).toBeInTheDocument();
    expect(screen.getByText("23 blocked")).toHaveClass("d_none", "md:d_block");
    expect(screen.getByText("3% cached")).toHaveClass("d_none", "md:d_block");
    expect(screen.getByText("FRA")).not.toHaveClass("d_none");
    expect(screen.getByText("DE")).not.toHaveClass("d_none");
    expect(screen.getByRole("img", { name: "Cloudflare" })).not.toHaveClass("d_none");
  });

  it("omits empty extras so a local request still shows the lockup", async () => {
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
    expect(screen.getByRole("img", { name: "Cloudflare" })).toBeInTheDocument();
    expect(screen.queryByText(/blocked/)).not.toBeInTheDocument();
    expect(screen.queryByText(/cached/)).not.toBeInTheDocument();
  });
});
