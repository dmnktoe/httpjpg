import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FooterStatus } from "./footer-status";

const STATUS_PAYLOAD = {
  letterboxd: {
    films: [{ title: "Stalker", year: "1979", rating: null, url: "https://l.test/f" }],
  },
  discogs: {
    releases: [{ artist: "DJ Shadow", title: "Endtroducing.....", url: "https://d.test/r" }],
  },
  lastfm: {
    tracks: [
      {
        title: "Teardrop",
        artist: "Massive Attack",
        url: "https://lfm.test/t",
        image: null,
        nowPlaying: true,
        loved: false,
      },
    ],
    total: 48213,
  },
  steam: {
    profile: {
      name: "dmnktoe",
      avatar: null,
      url: "https://s.test/p",
      isOnline: false,
      inGame: null,
    },
    games: [
      {
        appId: 1245620,
        name: "ELDEN RING",
        minutesTwoWeeks: 845,
        minutesTotal: 9000,
        icon: null,
        url: "https://s.test/g",
      },
    ],
  },
  youtube: {
    channel: {
      id: "UC",
      title: "httpjpg",
      avatar: null,
      url: "https://y.test/c",
      subscriberCount: 1230,
    },
    videos: [
      {
        id: "v",
        title: "Studio tour",
        url: "https://y.test/v",
        thumbnail: null,
        publishedAt: null,
      },
    ],
  },
  github: {
    profile: { login: "dmnktoe", avatar: null, url: "https://g.test/u" },
    activity: [
      {
        kind: "push",
        verb: "pushed to",
        repo: "dmnktoe/httpjpg",
        detail: "main",
        url: "https://g.test/c",
        createdAt: null,
      },
    ],
  },
  reddit: { username: "dmnktoe", karma: 12345, url: "https://r.test/u" },
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

/** Opens the folded lines once the envelope has landed. */
async function expandMore() {
  fireEvent.click(await screen.findByRole("button", { name: /more/ }));
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
    await expandMore();
    expect(screen.getByText("DJ Shadow — Endtroducing.....")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Power Couple")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/status", expect.anything());
  });

  it("renders the latest scrobble with the lifetime count", async () => {
    mockFetch({ "/api/status": STATUS_PAYLOAD });

    render(<FooterStatus lastfmEnabled />);

    await waitFor(() => expect(screen.getByText("Teardrop")).toBeInTheDocument());
    expect(screen.getByLabelText("now playing")).toBeInTheDocument();
    expect(screen.getByLabelText("48213 scrobbles")).toBeInTheDocument();
    expect(screen.queryByText("Stalker")).not.toBeInTheDocument();
  });

  it("renders the Steam, YouTube and GitHub lines from the same envelope", async () => {
    const fetchMock = mockFetch({ "/api/status": STATUS_PAYLOAD });

    render(<FooterStatus steamEnabled youtubeEnabled githubEnabled redditEnabled />);

    await waitFor(() => expect(screen.getByText("ELDEN RING")).toBeInTheDocument());
    await expandMore();
    expect(screen.getByText("Studio tour")).toBeInTheDocument();
    expect(screen.getByText("dmnktoe/httpjpg")).toBeInTheDocument();
    expect(screen.getByText("u/dmnktoe")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("orders the lines like the status widget: live first, then newest, then undated", async () => {
    mockFetch({
      "/api/status": {
        ...STATUS_PAYLOAD,
        letterboxd: {
          films: [{ title: "Stalker", watchedDate: "2026-11-01", url: "https://l.test/f" }],
        },
        discogs: {
          releases: [
            { artist: "DJ Shadow", title: "Endtroducing.....", addedAt: "2026-11-20T10:00:00Z" },
          ],
        },
        lastfm: { ...STATUS_PAYLOAD.lastfm, tracks: [{ ...STATUS_PAYLOAD.lastfm.tracks[0] }] },
        x: { ...STATUS_PAYLOAD.x, posts: [{ text: "Hello world", url: "https://x.test/p" }] },
      },
    });

    const { container } = render(
      <FooterStatus letterboxdEnabled discogsEnabled lastfmEnabled xEnabled redditEnabled />,
    );

    await waitFor(() => expect(screen.getByText("Stalker")).toBeInTheDocument());
    await expandMore();
    const text = container.textContent ?? "";
    const order = ["Teardrop", "Endtroducing", "Stalker", "u/dmnktoe", "Hello world"].map(
      (needle) => text.indexOf(needle),
    );
    expect(order.every((position) => position >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
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

  it("shows the freshest three lines and folds the rest behind a toggle", async () => {
    mockFetch({ "/api/status": STATUS_PAYLOAD });

    render(
      <FooterStatus lastfmEnabled letterboxdEnabled discogsEnabled xEnabled trophiesEnabled />,
    );

    await waitFor(() => expect(screen.getByText("Teardrop")).toBeInTheDocument());
    expect(screen.getByText("Stalker")).toBeInTheDocument();
    expect(screen.getByText("DJ Shadow — Endtroducing.....")).toBeInTheDocument();
    expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
    expect(screen.queryByText("Power Couple")).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "[ + 2 more ]" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Power Couple")).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("[ − less ]");

    fireEvent.click(toggle);

    expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
  });

  it("leaves empty sources out of the visible few and the tally", async () => {
    mockFetch({
      "/api/status": { ...STATUS_PAYLOAD, letterboxd: null, discogs: null },
    });

    render(
      <FooterStatus lastfmEnabled letterboxdEnabled discogsEnabled xEnabled trophiesEnabled />,
    );

    await waitFor(() => expect(screen.getByText("Teardrop")).toBeInTheDocument());
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Power Couple")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
