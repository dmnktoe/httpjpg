"use client";

import { Box } from "../box/box";
import { Link } from "../link/link";

export interface CommandPaletteSource {
  title: string;
  href: string;
}

interface CommandPaletteAnswerProps {
  answer: string;
  sources: CommandPaletteSource[];
  isStreaming: boolean;
  errorMessage?: string;
}

export function CommandPaletteAnswer({
  answer,
  sources,
  isStreaming,
  errorMessage,
}: CommandPaletteAnswerProps) {
  return (
    <Box css={{ px: "4", py: "3", borderColor: "pageBorder", borderBottom: "1px solid" }}>
      <Box
        as="span"
        css={{
          display: "block",
          mb: "2",
          opacity: 0.4,
          fontFamily: "mono",
          fontSize: "sm",
          letterSpacing: "wide",
          textTransform: "uppercase",
        }}
      >
        answer
      </Box>

      {errorMessage ? (
        <Box role="alert" css={{ color: "danger.500", fontFamily: "mono", fontSize: "md" }}>
          {errorMessage}
        </Box>
      ) : (
        <Box
          // Assertive would interrupt on every token; polite lets a screen
          // reader read the answer once it settles.
          aria-live="polite"
          aria-busy={isStreaming}
          css={{
            fontFamily: "sans",
            fontSize: "md",
            lineHeight: "relaxed",
            whiteSpace: "pre-wrap",
          }}
        >
          {answer}
          {isStreaming && (
            <Box
              as="span"
              aria-hidden="true"
              css={{
                display: "inline-block",
                w: "2",
                ml: "1",
                bg: "pageFg",
                animation: "caretBlink 1s steps(1, end) infinite",
              }}
            >
              &nbsp;
            </Box>
          )}
        </Box>
      )}

      {sources.length > 0 && (
        <Box
          css={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "2",
            mt: "3",
            opacity: 0.7,
            fontFamily: "mono",
            fontSize: "sm",
          }}
        >
          <Box as="span" css={{ opacity: 0.6, textTransform: "uppercase" }}>
            sources
          </Box>
          {sources.map((source, index) => (
            <Link key={source.href} href={source.href}>
              [{index + 1}] {source.title}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}
