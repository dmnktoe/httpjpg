"use client";

import { useEffect, useState, type SyntheticEvent } from "react";

import { getFaviconUrl } from "../../lib/favicon-url";
import { Box } from "../box/box";

const SPINNER_FRAMES = ["|", "/", "-", "\\"];
const SPINNER_INTERVAL_MS = 120;

export function Favicon({ href }: { href: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const [frame, setFrame] = useState(0);
  const src = getFaviconUrl(href);

  useEffect(() => {
    if (!src || state !== "loading") return;
    const timer = setInterval(() => setFrame((current) => current + 1), SPINNER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [src, state]);

  const settleFromDom = (node: HTMLImageElement | null) => {
    if (node?.complete) {
      setState(isRenderedFavicon(node) ? "loaded" : "failed");
    }
  };

  if (!src) return null;

  if (state === "failed") {
    return (
      <Box as="span" aria-hidden="true" css={FALLBACK_STYLES}>
        🔗
      </Box>
    );
  }

  return (
    <>
      {state === "loading" && (
        <Box as="span" aria-hidden="true" css={SPINNER_STYLES}>
          {SPINNER_FRAMES[frame % SPINNER_FRAMES.length]}
        </Box>
      )}
      <Box
        as="img"
        ref={settleFromDom}
        src={src}
        alt=""
        aria-hidden="true"
        width={14}
        height={14}
        onLoad={(event: SyntheticEvent<HTMLImageElement>) =>
          setState(isRenderedFavicon(event.currentTarget) ? "loaded" : "failed")
        }
        onError={() => setState("failed")}
        css={state === "loaded" ? FAVICON_STYLES : HIDDEN_FAVICON_STYLES}
      />
    </>
  );
}

/** The proxy answers a miss with a 1×1 PNG and HTTP 200, so onLoad still fires. */
function isRenderedFavicon(image: HTMLImageElement): boolean {
  return image.naturalWidth > 1 && image.naturalHeight > 1;
}

const FAVICON_STYLES = {
  display: { base: "none", md: "inline-block" },
  flexShrink: 0,
  w: "14px",
  h: "14px",
  mr: "0.25em",
  verticalAlign: "middle",
  imageRendering: "pixelated",
} as const;

const HIDDEN_FAVICON_STYLES = {
  display: "none",
} as const;

const SPINNER_STYLES = {
  display: { base: "none", md: "inline-block" },
  flexShrink: 0,
  w: "14px",
  h: "14px",
  mr: "0.25em",
  verticalAlign: "middle",
  fontFamily: "mono",
  fontSize: "10px",
  lineHeight: "14px",
  textAlign: "center",
  opacity: 0.4,
} as const;

const FALLBACK_STYLES = {
  display: { base: "none", md: "inline-block" },
  flexShrink: 0,
  w: "14px",
  h: "14px",
  mr: "0.25em",
  verticalAlign: "middle",
  fontSize: "10px",
  lineHeight: "14px",
  textAlign: "center",
  opacity: 0.5,
} as const;
