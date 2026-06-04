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
      spotifyEnabled: true,
      letterboxdEnabled: false,
      nostalgiaSlideshowEnabled: false,
      customCursorEnabled: true,
      mouseTrailEnabled: true,
    });
  });

  it("forwards configured values through", async () => {
    mockGetConfig.mockResolvedValue({
      psn_username: "dmnktoe",
      psn_enabled: true,
      spotify_enabled: false,
      letterboxd_enabled: true,
      nostalgia_slideshow_enabled: true,
      custom_cursor_enabled: false,
      mouse_trail_enabled: false,
    } as never);

    await expect(getWidgetConfig()).resolves.toEqual({
      psnUsername: "dmnktoe",
      psnEnabled: true,
      spotifyEnabled: false,
      letterboxdEnabled: true,
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

  it("enables every flag by default when no config exists", async () => {
    mockGetConfig.mockResolvedValue(null);
    await expect(getFeatureFlags()).resolves.toEqual({
      lastUpdatedBadgeEnabled: true,
      prevNextWorkEnabled: true,
      rssFeedEnabled: true,
    });
  });

  it("honors explicit false flags from the config", async () => {
    mockGetConfig.mockResolvedValue({
      last_updated_badge_enabled: false,
      prev_next_work_enabled: false,
      rss_feed_enabled: false,
    } as never);
    await expect(getFeatureFlags()).resolves.toEqual({
      lastUpdatedBadgeEnabled: false,
      prevNextWorkEnabled: false,
      rssFeedEnabled: false,
    });
  });
});
