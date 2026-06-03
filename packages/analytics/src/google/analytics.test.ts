import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({
  env: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123",
    NODE_ENV: "production",
  },
}));

import { trackGoogleEvent } from "./analytics";

describe("trackGoogleEvent", () => {
  let gtagSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    gtagSpy = vi.fn();
    vi.stubGlobal("window", { gtag: gtagSpy });
  });

  it("forwards the event to gtag with category and label", () => {
    trackGoogleEvent("now_playing_click", {
      category: "user_interaction",
      label: "spotify_widget",
    });

    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "now_playing_click",
      expect.objectContaining({
        event_category: "user_interaction",
        event_label: "spotify_widget",
      }),
    );
  });

  it("does not call gtag when window.gtag is unavailable", () => {
    vi.stubGlobal("window", {});

    trackGoogleEvent("now_playing_click");

    expect(gtagSpy).not.toHaveBeenCalled();
  });
});
