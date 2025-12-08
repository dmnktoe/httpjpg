"use client";

import {
  Box,
  Button,
  Container,
  Headline,
  Paragraph,
  Section,
} from "@httpjpg/ui";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Portfolio Error Boundary
 *
 * Catches errors in portfolio routes and displays a user-friendly error page.
 * Wrapped in Container/Section to match the page layout structure.
 */
export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: "portfolio",
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <Section
      pt={{ base: "16", md: "24" }}
      pb={{ base: "16", md: "24" }}
      fullWidth
      containerSize="2xl"
    >
      <Container size="lg" px={{ base: "4", md: "6", lg: "8" }}>
        <Box
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "6",
          }}
        >
          <Headline level={1}>Oops! Etwas ist schiefgelaufen</Headline>

          <Paragraph css={{ maxW: "prose", opacity: 80 }}>
            Es gab einen Fehler beim Laden dieser Seite. Bitte versuche es
            erneut oder kehre zur Startseite zurück.
          </Paragraph>

          {error.digest && (
            <Paragraph
              css={{ fontSize: "xs", opacity: 50, fontFamily: "mono" }}
            >
              Error ID: {error.digest}
            </Paragraph>
          )}

          <Box
            css={{
              display: "flex",
              gap: "4",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button onClick={reset}>Erneut versuchen</Button>
          </Box>

          <Paragraph>
            <a
              href="/"
              style={{
                textDecoration: "underline",
                opacity: 80,
              }}
            >
              Zurück zur Startseite
            </a>
          </Paragraph>
        </Box>
      </Container>
    </Section>
  );
}
