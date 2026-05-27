import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({
  env: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123",
    NODE_ENV: "production",
  },
}));

import { trackNowPlayingClick, trackWebVital } from "./analytics";

describe("analytics", () => {
  let gtagSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    gtagSpy = vi.fn();
    vi.stubGlobal("window", { gtag: gtagSpy });
  });

  it("trackNowPlayingClick", () => {
    trackNowPlayingClick();

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "now_playing_click",
      expect.objectContaining({ event_label: "spotify_widget" }),
    );
  });

  it("trackWebVital forwards vital as performance event with rounded value", () => {
    trackWebVital("LCP", 2345.67);

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "performance",
      expect.objectContaining({ event_label: "LCP", value: 2346 }),
    );
  });

  it("does not call gtag when window.gtag is unavailable", () => {
    vi.stubGlobal("window", {});

    trackNowPlayingClick();

    expect(gtagSpy).not.toHaveBeenCalled();
  });
});
