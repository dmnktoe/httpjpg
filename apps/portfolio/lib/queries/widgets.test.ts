import { beforeEach, vi } from "vitest";

vi.mock("./config", () => ({ getConfig: vi.fn() }));

import { getConfig } from "./config";
import { getFeatureFlags, getInterfaceConfig, getWidgetConfig } from "./widgets";

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
      xEnabled: false,
      spotifyEnabled: true,
      nostalgiaSlideshowEnabled: false,
      askEnabled: true,
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
      x_enabled: true,
      spotify_enabled: false,
      nostalgia_slideshow_enabled: true,
      ask_enabled: false,
    } as never);

    await expect(getWidgetConfig()).resolves.toEqual({
      psnUsername: "dmnktoe",
      psnEnabled: true,
      psnTrophyEnabled: true,
      discordEnabled: false,
      letterboxdEnabled: false,
      discogsEnabled: true,
      xEnabled: true,
      spotifyEnabled: false,
      nostalgiaSlideshowEnabled: true,
      askEnabled: false,
    });
  });
});

describe("getInterfaceConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps cursor, trail and veil on when no config exists", async () => {
    mockGetConfig.mockResolvedValue(null);
    await expect(getInterfaceConfig()).resolves.toEqual({
      customCursorEnabled: true,
      mouseTrailEnabled: true,
      headerScrollVeilEnabled: true,
    });
  });

  it("honors explicit flags from the config", async () => {
    mockGetConfig.mockResolvedValue({
      custom_cursor_enabled: false,
      mouse_trail_enabled: false,
      header_scroll_veil_enabled: false,
    } as never);
    await expect(getInterfaceConfig()).resolves.toEqual({
      customCursorEnabled: false,
      mouseTrailEnabled: false,
      headerScrollVeilEnabled: false,
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
