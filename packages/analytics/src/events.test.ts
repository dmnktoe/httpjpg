import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({
  env: {
    NEXT_PUBLIC_UMAMI_ID: "test-website-id",
    NODE_ENV: "production",
  },
}));

import {
  trackAskComplete,
  trackAskSubmit,
  trackAudioPlay,
  trackAudioSkip,
  trackEvent,
  trackLightboxOpen,
  trackNowPlayingClick,
  trackOutboundClick,
  trackSearchOpen,
  trackSearchSelect,
} from "./events";

describe("analytics event fan-out", () => {
  let umamiSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    umamiSpy = vi.fn();
    vi.stubGlobal("window", { umami: { track: umamiSpy } });
  });

  it("trackNowPlayingClick reaches Umami", () => {
    trackNowPlayingClick({
      title: "Song",
      artist: "Artist",
      href: "https://open.spotify.com/track/abc",
    });

    expect(umamiSpy).toHaveBeenCalledWith("now_playing_click", {
      widget: "spotify",
      title: "Song",
      artist: "Artist",
      href: "https://open.spotify.com/track/abc",
    });
  });

  it("trackEvent sends a generic name and data", () => {
    trackEvent("custom_thing", { foo: "bar", count: 2 });

    expect(umamiSpy).toHaveBeenCalledWith("custom_thing", { foo: "bar", count: 2 });
  });

  it("search and ask helpers send structured payloads", () => {
    trackSearchOpen("keyboard");
    trackSearchSelect({ kind: "work", href: "/work/x", queryLength: 4 });
    trackAskSubmit({ queryLength: 12 });
    trackAskComplete({ hasAction: true, sourceCount: 3 });

    expect(umamiSpy).toHaveBeenCalledWith("search_open", { source: "keyboard" });
    expect(umamiSpy).toHaveBeenCalledWith("search_select", {
      kind: "work",
      href: "/work/x",
      query_length: 4,
    });
    expect(umamiSpy).toHaveBeenCalledWith("ask_submit", { query_length: 12 });
    expect(umamiSpy).toHaveBeenCalledWith("ask_complete", {
      has_action: true,
      source_count: 3,
    });
  });

  it("lightbox and outbound helpers include media identity and clip long strings", () => {
    const longHref = `https://example.com/${"a".repeat(600)}`;
    const longLabel = `label-${"b".repeat(200)}`;
    trackLightboxOpen({
      type: "image",
      index: 1,
      count: 4,
      src: "https://cdn.example.com/shot.jpg",
      alt: "Cover still",
    });
    trackOutboundClick({
      destination: "letterboxd",
      href: longHref,
      label: longLabel,
    });

    expect(umamiSpy).toHaveBeenCalledWith("lightbox_open", {
      type: "image",
      index: 1,
      count: 4,
      src: "https://cdn.example.com/shot.jpg",
      alt: "Cover still",
    });
    const outbound = umamiSpy.mock.calls.find((call) => call[0] === "outbound_click");
    expect(outbound?.[1].href).toHaveLength(480);
    expect(outbound?.[1].destination).toBe("letterboxd");
    expect(outbound?.[1].label).toHaveLength(160);
  });

  it("audio helpers send file src, title, and artist", () => {
    trackAudioPlay({
      title: "Intro",
      artist: "httpjpg",
      src: "https://cdn.example.com/intro.mp3",
      href: "/work/demo",
    });
    trackAudioSkip({
      direction: "next",
      title: "Outro",
      src: "https://cdn.example.com/outro.mp3",
    });

    expect(umamiSpy).toHaveBeenCalledWith("audio_play", {
      title: "Intro",
      artist: "httpjpg",
      src: "https://cdn.example.com/intro.mp3",
      href: "/work/demo",
    });
    expect(umamiSpy).toHaveBeenCalledWith("audio_skip", {
      direction: "next",
      title: "Outro",
      src: "https://cdn.example.com/outro.mp3",
    });
  });

  it("drops undefined values and non-finite numbers from payloads", () => {
    trackEvent("scrub", { keep: "yes", skip: undefined, bad: Number.NaN });

    expect(umamiSpy).toHaveBeenCalledWith("scrub", { keep: "yes" });
  });
});
