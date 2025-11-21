"use client";

import { Box, Button, Headline, Paragraph } from "@httpjpg/ui";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global Error boundary for Next.js App Router
 * Captures errors with Sentry and shows user-friendly error page
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
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
            minH: "100vh",
            p: "4",
          }}
        >
          <Box
            css={{
              maxW: "2xl",
              textAlign: "center",
            }}
          >
            <Headline level={1}>Something went wrong!</Headline>

            <Paragraph css={{ mt: "4", mb: "6" }}>
              An unexpected error occurred. Our team has been notified.
            </Paragraph>

            <Button onClick={reset}>Try again</Button>
          </Box>
        </Box>
      </body>
    </html>
  );
}
