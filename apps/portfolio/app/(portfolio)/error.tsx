"use client";

import { captureClientException } from "@httpjpg/observability/sentry/client.ts";
import {
  ASCII_DIVIDER_ARROWS,
  ASCII_OFFLINE,
  AsciiArt,
  Box,
  Button,
  Container,
  Headline,
  Paragraph,
  Section,
} from "@httpjpg/ui";
import { useEffect } from "react";

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error, {
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
          <AsciiArt label="no signal" css={{ fontSize: "sm", opacity: 0.7 }}>
            {ASCII_OFFLINE}
          </AsciiArt>

          <Headline level={1}>Oops! Etwas ist schiefgelaufen</Headline>

          <Paragraph css={{ maxW: "prose", opacity: 80, fontFamily: "mono" }}>
            Es gab einen Fehler beim Laden dieser Seite. Bitte versuche es erneut oder kehre zur
            Startseite zurück.
          </Paragraph>

          {error.digest && (
            <Paragraph css={{ fontSize: "sm", opacity: 50, fontFamily: "mono" }}>
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
            <Button onClick={reset}>↻ Erneut versuchen</Button>
          </Box>

          <Box as="span" css={{ fontFamily: "mono", fontSize: "xs", opacity: 0.35 }}>
            {ASCII_DIVIDER_ARROWS}
          </Box>

          <Paragraph>
            <Box
              as="a"
              href="/"
              css={{
                textDecoration: "underline",
                opacity: 80,
                fontFamily: "mono",
              }}
            >
              ← Zurück zur Startseite
            </Box>
          </Paragraph>
        </Box>
      </Container>
    </Section>
  );
}
