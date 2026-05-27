import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({
  env: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123",
    NODE_ENV: "production",
  },
}));

import {
  GA_CATEGORIES,
  trackContactInteraction,
  trackCursorInteraction,
  trackError,
  trackEvent,
  trackFooterClick,
  trackHeaderInteraction,
  trackMediaPlay,
  trackNavigation,
  trackNowPlayingClick,
  trackPageView,
  trackPerformance,
  trackWebVital,
  trackWorkInteraction,
  trackWorkView,
} from "./analytics";

describe("analytics", () => {
  let gtagSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    gtagSpy = vi.fn();
    vi.stubGlobal("window", { gtag: gtagSpy });
  });

  describe("trackEvent", () => {
    it("calls gtag with event name and params", () => {
      trackEvent("test_event", { category: GA_CATEGORIES.NAVIGATION, label: "home" });

      expect(gtagSpy).toHaveBeenCalledWith("event", "test_event", {
        event_category: GA_CATEGORIES.NAVIGATION,
        event_label: "home",
        value: undefined,
        category: GA_CATEGORIES.NAVIGATION,
        label: "home",
      });
    });

    it("does not call gtag when window.gtag is unavailable", () => {
      vi.stubGlobal("window", {});

      trackEvent("test_event");

      expect(gtagSpy).not.toHaveBeenCalled();
    });
  });

  describe("trackPageView", () => {
    it("sends config with page_path", () => {
      trackPageView("/work/project");

      expect(gtagSpy).toHaveBeenCalledWith("config", "G-TEST123", { page_path: "/work/project" });
    });
  });

  describe("trackWebVital", () => {
    it("forwards vital as performance event with rounded value", () => {
      trackWebVital("LCP", 2345.67);

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "performance",
        expect.objectContaining({ event_label: "LCP", value: 2346 }),
      );
    });

    it("tracks INP", () => {
      trackWebVital("INP", 53.2);

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "performance",
        expect.objectContaining({ event_label: "INP", value: 53 }),
      );
    });
  });

  describe("tracking helpers", () => {
    it("trackNavigation", () => {
      trackNavigation("/work", "portfolio");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "navigation",
        expect.objectContaining({ event_label: "portfolio", destination: "/work" }),
      );
    });

    it("trackWorkView", () => {
      trackWorkView("abc", "My Project");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "work_view",
        expect.objectContaining({ event_label: "My Project", work_id: "abc" }),
      );
    });

    it("trackWorkInteraction", () => {
      trackWorkInteraction("abc", "image_click");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "work_interaction",
        expect.objectContaining({ event_label: "image_click", work_id: "abc" }),
      );
    });

    it("trackMediaPlay", () => {
      trackMediaPlay("video", "https://example.com/video.mp4");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "media_play",
        expect.objectContaining({
          event_label: "video",
          media_url: "https://example.com/video.mp4",
        }),
      );
    });

    it("trackContactInteraction", () => {
      trackContactInteraction("submit");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "contact_form",
        expect.objectContaining({ event_label: "submit" }),
      );
    });

    it("trackError", () => {
      trackError("api_error", "timeout", true);

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "error",
        expect.objectContaining({
          event_label: "api_error",
          error_message: "timeout",
          fatal: true,
        }),
      );
    });

    it("trackCursorInteraction", () => {
      trackCursorInteraction("hover");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "cursor_interaction",
        expect.objectContaining({ event_label: "hover" }),
      );
    });

    it("trackNowPlayingClick", () => {
      trackNowPlayingClick();

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "now_playing_click",
        expect.objectContaining({ event_label: "spotify_widget" }),
      );
    });

    it("trackHeaderInteraction", () => {
      trackHeaderInteraction("menu_open");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "header_interaction",
        expect.objectContaining({ event_label: "menu_open" }),
      );
    });

    it("trackFooterClick", () => {
      trackFooterClick("social", "https://github.com");

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "footer_click",
        expect.objectContaining({ event_label: "social", destination: "https://github.com" }),
      );
    });

    it("trackPerformance", () => {
      trackPerformance("custom_metric", 42.7);

      expect(gtagSpy).toHaveBeenCalledWith(
        "event",
        "performance",
        expect.objectContaining({ event_label: "custom_metric", value: 43 }),
      );
    });
  });
});
