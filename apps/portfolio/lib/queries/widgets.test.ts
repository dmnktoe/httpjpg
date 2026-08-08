import { beforeEach, vi } from "vitest";

vi.mock("./config", () => ({ getConfig: vi.fn() }));

import { getConfig } from "./config";
import { getFeatureFlags, getWidgetConfig } from "./widgets";

const mockGetConfig = vi.mocked(getConfig);

describe("getWidgetConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the safe defaults when the config story is null", async () => {
    mockGetConfig.mockResolvedValue(null);
    await expect(getWidgetConfig()).resolves.toEqual({
      psnUsername: undefined,
      psnEnabled: false,
      psnTrophyEnabled: false,
      discordEnabled: true,
      letterboxdEnabled: true,
      discogsEnabled: false,
      mastodonEnabled: false,
      umamiCounterEnabled: false,
      spotifyEnabled: true,
      nostalgiaSlideshowEnabled: false,
      customCursorEnabled: true,
      mouseTrailEnabled: true,
    });
  });

  it("forwards configured values through", async () => {
    mockGetConfig.mockResolvedValue({
      psn_username: "dmnktoe",
      psn_enabled: true,
      psn_trophy_enabled: true,
      discord_enabled: false,
      letterboxd_enabled: false,
      discogs_enabled: true,
      mastodon_enabled: true,
      umami_counter_enabled: true,
      spotify_enabled: false,
      nostalgia_slideshow_enabled: true,
      custom_cursor_enabled: false,
      mouse_trail_enabled: false,
    } as never);

    await expect(getWidgetConfig()).resolves.toEqual({
      psnUsername: "dmnktoe",
      psnEnabled: true,
      psnTrophyEnabled: true,
      discordEnabled: false,
      letterboxdEnabled: false,
      discogsEnabled: true,
      mastodonEnabled: true,
      umamiCounterEnabled: true,
      spotifyEnabled: false,
      nostalgiaSlideshowEnabled: true,
      customCursorEnabled: false,
      mouseTrailEnabled: false,
    });
  });
});

describe("getFeatureFlags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the established flags on and the opt-in badges off when no config exists", async () => {
    mockGetConfig.mockResolvedValue(null);
    await expect(getFeatureFlags()).resolves.toEqual({
      lastUpdatedBadgeEnabled: true,
      webVitalsBadgeEnabled: false,
      buildBadgeEnabled: false,
      prevNextWorkEnabled: true,
      rssFeedEnabled: true,
    });
  });

  it("honors explicit flags from the config", async () => {
    mockGetConfig.mockResolvedValue({
      last_updated_badge_enabled: false,
      web_vitals_badge_enabled: true,
      build_badge_enabled: true,
      prev_next_work_enabled: false,
      rss_feed_enabled: false,
    } as never);
    await expect(getFeatureFlags()).resolves.toEqual({
      lastUpdatedBadgeEnabled: false,
      webVitalsBadgeEnabled: true,
      buildBadgeEnabled: true,
      prevNextWorkEnabled: false,
      rssFeedEnabled: false,
    });
  });
});
