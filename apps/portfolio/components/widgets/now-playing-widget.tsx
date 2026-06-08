"use client";

import { trackNowPlayingClick } from "@httpjpg/analytics";
import { NowPlaying } from "@httpjpg/now-playing";
import { useNowPlaying } from "@httpjpg/spotify";
import { Box } from "@httpjpg/ui";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const IDLE_ARTWORK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3E♪%3C/text%3E%3C/svg%3E";

// Brutalist ASCII faces whose eyes reuse the widget's glyph language: ⋄ (idle/premium), ╳ (error).
const PREMIUM_ARTWORK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23a3a3a3' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='30' font-weight='bold' text-anchor='middle' dy='.35em' fill='%23ef4444'%3E⋄_⋄%3C/text%3E%3C/svg%3E";

const ERROR_ARTWORK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ef4444' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='30' font-weight='bold' text-anchor='middle' dy='.35em' fill='white'%3E╳_╳%3C/text%3E%3C/svg%3E";

const IDLE_COLOR = "rgba(163, 163, 163, 0.6)";
const DANGER_COLOR = "rgba(239, 68, 68, 0.9)";
const DANGER_TEXT_COLOR = "#ef4444";

function NowPlayingWidgetComponent() {
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, errorCode } = useNowPlaying({
    endpoint: "/api/spotify/now-playing",
    pollInterval: 10000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleClick = () => {
    trackNowPlayingClick();
  };

  const errorView =
    errorCode === "premium_missing"
      ? {
          title: "╳╳ premium missing 🫪 ╳╳",
          artist: "⋄ ⋄ ⋄ (spotify(no_premium)) ⋄ ⋄ ⋄",
          artwork: PREMIUM_ARTWORK,
          vibrantColor: IDLE_COLOR,
          textColor: DANGER_TEXT_COLOR,
        }
      : errorCode
        ? {
            title: "╳╳ error 500 ╳╳",
            artist: "⋄ ⋄ ⋄ (spotify(error)) ⋄ ⋄ ⋄",
            artwork: ERROR_ARTWORK,
            vibrantColor: DANGER_COLOR,
            textColor: "white",
          }
        : null;

  const content = (
    <Box css={{ display: "none", md: { display: "block" } }}>
      <button type="button" onClick={handleClick} style={{ all: "unset" }}>
        {errorView ? (
          <NowPlaying
            title={errorView.title}
            artist={errorView.artist}
            artwork={errorView.artwork}
            isPlaying={false}
            autoExtractColor={false}
            vibrantColor={errorView.vibrantColor}
            textColor={errorView.textColor}
          />
        ) : (
          <NowPlaying
            title={isLoading ? "Loading..." : data?.title || "╱╱ #welovemusic ╱╱"}
            artist={isLoading ? "..." : data?.artist || "⋄ ⋄ ⋄ (spotify(none)) ⋄ ⋄ ⋄"}
            artwork={data?.artwork || IDLE_ARTWORK}
            isPlaying={data?.isPlaying || false}
            isLoading={isLoading}
            autoExtractColor={!!data && !isLoading}
            vibrantColor={!data || isLoading ? IDLE_COLOR : undefined}
            textColor={!data || isLoading ? "white" : undefined}
          />
        )}
      </button>
    </Box>
  );

  return createPortal(content, document.body);
}

export const NowPlayingWidget = dynamic(() => Promise.resolve(NowPlayingWidgetComponent), {
  ssr: false,
});
