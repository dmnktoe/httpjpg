"use client";

import { captureClientException } from "@httpjpg/observability/sentry/client.ts";
import { ASCII_500, AsciiArt, Box, Button, Headline, Paragraph } from "@httpjpg/ui";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
      level: "fatal",
      tags: {
        errorBoundary: "global",
        digest: error.digest,
      },
      contexts: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
    });
  }, [error]);

  return (
    <html lang="de">
      <body>
        <Box
          as="main"
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minH: "100lvh",
            p: "4",
          }}
        >
          <Box
            css={{
              maxW: "2xl",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4",
            }}
          >
            <AsciiArt label="fatal error" css={{ fontSize: "xs", opacity: 0.6 }}>
              {ASCII_500}
            </AsciiArt>

            <Headline level={1}>Something went wrong!</Headline>

            <Paragraph css={{ mt: "2", mb: "4", fontFamily: "mono" }}>
              An unexpected error occurred. Our team has been notified.
            </Paragraph>

            <Button onClick={reset}>↻ Try again</Button>
          </Box>
        </Box>
      </body>
    </html>
  );
}
