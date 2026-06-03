"use client";

import { captureClientException } from "@httpjpg/observability/sentry/client.ts";
import { ASCII_500, AsciiArt, Box, Headline, Link, Paragraph } from "@httpjpg/ui";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Portfolio] Render error:", error);
    captureClientException(error, {
      tags: {
        errorBoundary: "portfolio-slug",
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <Box css={{ px: { base: "4", md: "8" }, py: { base: "12", md: "20" } }}>
      <Headline as="h1" css={{ fontSize: { base: "6xl", md: "8xl" } }}>
        500
      </Headline>
      <Paragraph css={{ mt: "4", fontFamily: "mono" }}>
        ↳ something bricked on the way to this page ✦
      </Paragraph>
      <AsciiArt
        label="crashed terminal"
        css={{ mt: "6", fontSize: "xs", opacity: 0.55, textAlign: "left" }}
      >
        {ASCII_500}
      </AsciiArt>
      <Box
        css={{
          display: "flex",
          gap: "6",
          mt: "8",
          fontFamily: "mono",
          fontSize: "sm",
          alignItems: "center",
        }}
      >
        <Box
          as="button"
          type="button"
          onClick={reset}
          css={{
            cursor: "pointer",
            bg: "transparent",
            border: "1px solid",
            borderColor: "neutral.400",
            px: "4",
            py: "2",
            color: "inherit",
            fontFamily: "mono",
            _hover: { bg: "neutral.100" },
          }}
        >
          ↻ retry
        </Box>
        <Link href="/">← back to /</Link>
      </Box>
      {error.digest && (
        <Box css={{ mt: "4", fontFamily: "mono", fontSize: "xs", opacity: 0.4 }}>
          digest: {error.digest}
        </Box>
      )}
    </Box>
  );
}
