import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchPsnTrophies, isPsnUsername, parsePsnTrophyFeed } from "./psn-trophies";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function rssResponse(xml: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => xml,
  } as Response;
}

// Trimmed from a real psntrophyleaders.com feed item.
const TROPHY_ITEM = `
  <item>
    <title><![CDATA[bullensohn6 | Stolz der Nation]]></title>
    <description><![CDATA[<table cellpadding="5"><tr>
      <td><a href="https://psntrophyleaders.com/user/view/bullensohn6/battlefield-6-ps5/35"><img src="https://np.sentl.com/images/games/96447344/m/488f5065635.png" width="50"></a><br/><small><strong><font color="#777">Silver</font></strong></small></td>
      <td width="350"><strong><a href="https://psntrophyleaders.com/user/view/bullensohn6/battlefield-6-ps5">Battlefield&#8482; 6</a></strong> <small>(<font color="#999999">PS5</font>)</small><br/><strong>Stolz der Nation</strong><br/><font color="#666">Get 250 sniper rifle kills as Recon in Multiplayer</font><br/><small><font color="#999">Earned Mon, 27 Apr 2026 05:23:08 -0400</font></small></td>
      <td><a href="https://psntrophyleaders.com/user/view/bullensohn6"><img src="https://static-resource.np.community.playstation.net/avatar/3RD/30004.png" width="50"/><br/>bullensohn6</a></td>
    </tr></table>]]></description>
    <link>http://psntrophyleaders.com/user/view/bullensohn6/battlefield-6-ps5/35</link>
    <pubDate><![CDATA[Mon, 27 Apr 2026 09:23:08 +0000]]></pubDate>
  </item>`;

function feed(...items: string[]): string {
  return `<?xml version="1.0"?><rss><channel>${items.join("")}</channel></rss>`;
}

describe("parsePsnTrophyFeed", () => {
  it("extracts the trophy fields from an item", () => {
    const trophies = parsePsnTrophyFeed(feed(TROPHY_ITEM));
    expect(trophies).toHaveLength(1);
    expect(trophies[0]).toEqual({
      name: "Stolz der Nation",
      game: "Battlefield™ 6",
      platform: "PS5",
      type: "silver",
      description: "Get 250 sniper rifle kills as Recon in Multiplayer",
      earnedAt: "2026-04-27T09:23:08.000Z",
      url: "http://psntrophyleaders.com/user/view/bullensohn6/battlefield-6-ps5/35",
      avatar: "https://static-resource.np.community.playstation.net/avatar/3RD/30004.png",
    });
  });

  it("normalises each trophy tier to a lowercase type", () => {
    const platinum = TROPHY_ITEM.replace(
      '<font color="#777">Silver</font>',
      '<font color="#667FB2">Platinum</font>',
    );
    expect(parsePsnTrophyFeed(feed(platinum))[0].type).toBe("platinum");
  });

  it("keeps the feed's newest-first order", () => {
    const older = TROPHY_ITEM.replace("Stolz der Nation", "First Step");
    const trophies = parsePsnTrophyFeed(feed(TROPHY_ITEM, older));
    expect(trophies.map((t) => t.name)).toEqual(["Stolz der Nation", "First Step"]);
  });

  it("skips items without a recognisable trophy tier", () => {
    const noise = `<item><title>random</title><description><![CDATA[<p>no trophy here</p>]]></description><link>x</link></item>`;
    const trophies = parsePsnTrophyFeed(feed(noise, TROPHY_ITEM));
    expect(trophies).toHaveLength(1);
    expect(trophies[0].name).toBe("Stolz der Nation");
  });

  it("respects the limit", () => {
    const trophies = parsePsnTrophyFeed(feed(TROPHY_ITEM, TROPHY_ITEM, TROPHY_ITEM), 2);
    expect(trophies).toHaveLength(2);
  });

  it("returns nothing for a non-positive limit", () => {
    expect(parsePsnTrophyFeed(feed(TROPHY_ITEM), 0)).toEqual([]);
  });
});

describe("fetchPsnTrophies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the member RSS feed for the given username", async () => {
    mockFetch.mockResolvedValueOnce(rssResponse(feed(TROPHY_ITEM)));
    await fetchPsnTrophies("bullensohn6");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://psntrophyleaders.com/user/view/bullensohn6/rss",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("returns parsed trophies on success", async () => {
    mockFetch.mockResolvedValueOnce(rssResponse(feed(TROPHY_ITEM)));
    const result = await fetchPsnTrophies("bullensohn6");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.trophies[0].name).toBe("Stolz der Nation");
    }
  });

  it("surfaces a non-200 response as a failure", async () => {
    mockFetch.mockResolvedValueOnce(rssResponse("", false, 404));
    const result = await fetchPsnTrophies("ghost");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
    }
  });
});

describe("isPsnUsername", () => {
  it("accepts valid PSN online IDs", () => {
    expect(isPsnUsername("bullensohn6")).toBe(true);
    expect(isPsnUsername("dmnk-toe")).toBe(true);
    expect(isPsnUsername("a_b_c")).toBe(true);
  });

  it("rejects values with slashes, dots, or other unsafe characters", () => {
    expect(isPsnUsername("../etc")).toBe(false);
    expect(isPsnUsername("user/view")).toBe(false);
    expect(isPsnUsername("dom.user")).toBe(false);
    expect(isPsnUsername("1leadingdigit")).toBe(false);
    expect(isPsnUsername("ab")).toBe(false);
    expect(isPsnUsername("")).toBe(false);
    expect(isPsnUsername(undefined)).toBe(false);
  });
});
