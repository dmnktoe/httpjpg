import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({
  env: {
    NEXT_PUBLIC_UMAMI_ID: "test-website-id",
    NODE_ENV: "production",
  },
}));

import { trackUmamiEvent } from "./analytics";

describe("trackUmamiEvent", () => {
  let trackSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    trackSpy = vi.fn();
    vi.stubGlobal("window", { umami: { track: trackSpy } });
  });

  it("forwards the event name and data to umami.track", () => {
    trackUmamiEvent("now_playing_click", { widget: "spotify" });

    expect(trackSpy).toHaveBeenCalledWith("now_playing_click", { widget: "spotify" });
  });

  it("passes an empty object when no data is given", () => {
    trackUmamiEvent("now_playing_click");

    expect(trackSpy).toHaveBeenCalledWith("now_playing_click", {});
  });

  it("does not call umami when the tracker is unavailable", () => {
    vi.stubGlobal("window", {});

    trackUmamiEvent("now_playing_click");

    expect(trackSpy).not.toHaveBeenCalled();
  });
});
