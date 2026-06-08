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

// Danger artwork mirroring the Storybook "ErrorState" pattern: red tile with a 500 glyph.
const ERROR_ARTWORK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ef4444' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='monospace' font-size='34' font-weight='bold' text-anchor='middle' dy='.35em' fill='white'%3E500%3C/text%3E%3C/svg%3E";

const DANGER_COLOR = "rgba(239, 68, 68, 0.9)"; // @httpjpg/tokens colors.danger.500

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

  const isPremiumMissing = errorCode === "premium_missing";

  const content = (
    <Box css={{ display: "none", md: { display: "block" } }}>
      <button type="button" onClick={handleClick} style={{ all: "unset" }}>
        {isPremiumMissing ? (
          <NowPlaying
            title="premium missing"
            artist="⚠ spotify · error 500"
            artwork={ERROR_ARTWORK}
            isPlaying={false}
            autoExtractColor={false}
            vibrantColor={DANGER_COLOR}
            textColor="white"
          />
        ) : (
          <NowPlaying
            title={isLoading ? "Loading..." : data?.title || "╱╱ #welovemusic ╱╱"}
            artist={isLoading ? "..." : data?.artist || "⋄ ⋄ ⋄ (spotify(none)) ⋄ ⋄ ⋄"}
            artwork={data?.artwork || IDLE_ARTWORK}
            isPlaying={data?.isPlaying || false}
            isLoading={isLoading}
            autoExtractColor={!!data && !isLoading}
            vibrantColor={!data || isLoading ? "rgba(163, 163, 163, 0.6)" : undefined}
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
