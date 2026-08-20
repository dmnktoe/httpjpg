import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FooterStatus } from "./footer-status";

const STATUS_PAYLOAD = {
  letterboxd: {
    films: [{ title: "Stalker", year: "1979", rating: null, url: "https://l.test/f" }],
  },
  discogs: {
    releases: [{ artist: "DJ Shadow", title: "Endtroducing.....", url: "https://d.test/r" }],
  },
  x: {
    profile: { username: "dmnktoe", avatar: null, followerCount: null },
    posts: [{ text: "Hello world", url: "https://x.test/p" }],
  },
  trophies: {
    trophies: [
      { name: "Power Couple", game: "It Takes Two", type: "platinum", url: "https://p.test/t" },
    ],
    avatar: null,
  },
};

function mockFetch(byUrl: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string) => ({
    ok: url in byUrl,
    json: async () => byUrl[url],
  }));
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

describe("FooterStatus", () => {
  it("fetches every slow-moving widget over a single request", async () => {
    const fetchMock = mockFetch({ "/api/status": STATUS_PAYLOAD });

    render(<FooterStatus letterboxdEnabled discogsEnabled xEnabled trophiesEnabled />);

    await waitFor(() => expect(screen.getByText("Stalker")).toBeInTheDocument());
    expect(screen.getByText("DJ Shadow — Endtroducing.....")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Power Couple")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/status", expect.anything());
  });

  it("keeps Discord on its own connection so it can poll", async () => {
    const fetchMock = mockFetch({
      "/api/status": STATUS_PAYLOAD,
      "/api/discord": { status: "online" },
    });

    render(<FooterStatus discordEnabled discogsEnabled />);

    await waitFor(() => expect(screen.getByText("online")).toBeInTheDocument());
    expect(fetchMock.mock.calls.map((call) => call[0]).sort()).toEqual([
      "/api/discord",
      "/api/status",
    ]);
  });

  it("requests nothing when every widget is switched off", async () => {
    const fetchMock = mockFetch({});

    const { container } = render(<FooterStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not request the envelope for Discord alone", async () => {
    const fetchMock = mockFetch({ "/api/discord": { status: "idle" } });

    render(<FooterStatus discordEnabled />);

    await waitFor(() => expect(screen.getByText("idle")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/discord", expect.anything());
  });

  it("renders only the widgets the CMS enabled", async () => {
    mockFetch({ "/api/status": STATUS_PAYLOAD });

    render(<FooterStatus discogsEnabled />);

    await waitFor(() =>
      expect(screen.getByText("DJ Shadow — Endtroducing.....")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Stalker")).not.toBeInTheDocument();
    expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
  });

  it("drops the lines whose data came back null and keeps the rest", async () => {
    mockFetch({
      "/api/status": { ...STATUS_PAYLOAD, x: null, trophies: null },
    });

    render(<FooterStatus letterboxdEnabled discogsEnabled xEnabled trophiesEnabled />);

    await waitFor(() => expect(screen.getByText("Stalker")).toBeInTheDocument());
    expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
    expect(screen.queryByText("Power Couple")).not.toBeInTheDocument();
  });
});
