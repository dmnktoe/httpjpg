import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({
  env: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123",
    NEXT_PUBLIC_UMAMI_ID: "test-website-id",
    NODE_ENV: "production",
  },
}));

import { trackNowPlayingClick, trackWebVital } from "./events";

describe("analytics event fan-out", () => {
  let gtagSpy: ReturnType<typeof vi.fn>;
  let umamiSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    gtagSpy = vi.fn();
    umamiSpy = vi.fn();
    vi.stubGlobal("window", { gtag: gtagSpy, umami: { track: umamiSpy } });
  });

  it("trackNowPlayingClick reaches both providers", () => {
    trackNowPlayingClick();

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "now_playing_click",
      expect.objectContaining({ event_label: "spotify_widget" }),
    );
    expect(umamiSpy).toHaveBeenCalledWith("now_playing_click", { widget: "spotify" });
  });

  it("trackWebVital rounds the value and reaches both providers", () => {
    trackWebVital("LCP", 2345.67);

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "performance",
      expect.objectContaining({ event_label: "LCP", value: 2346 }),
    );
    expect(umamiSpy).toHaveBeenCalledWith("web_vital", { metric: "LCP", value: 2346 });
  });

  it("a missing provider does not block the other", () => {
    vi.stubGlobal("window", { umami: { track: umamiSpy } });

    trackNowPlayingClick();

    expect(gtagSpy).not.toHaveBeenCalled();
    expect(umamiSpy).toHaveBeenCalledTimes(1);
  });
});
