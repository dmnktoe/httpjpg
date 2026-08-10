"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";
import { Button } from "../button/button";
import { Link } from "../link/link";

export interface CommandPaletteSource {
  title: string;
  href: string;
}

/**
 * Where the answer points. The caller decides what following it means — the
 * palette only renders the affordance and reports the click.
 */
export interface CommandPaletteAction {
  type: "navigate";
  href: string;
  title: string;
  kind?: "work" | "page";
}

interface CommandPaletteAnswerProps {
  answer: string;
  sources: CommandPaletteSource[];
  action?: CommandPaletteAction;
  isStreaming: boolean;
  errorMessage?: string;
  onSourceClick: () => void;
  onAction?: (action: CommandPaletteAction) => void;
}

export function CommandPaletteAnswer({
  answer,
  sources,
  action,
  isStreaming,
  errorMessage,
  onSourceClick,
  onAction,
}: CommandPaletteAnswerProps) {
  return (
    <Box
      css={{
        px: "4",
        py: "3",
        borderColor: "pageBorder",
        borderBottom: "1px solid",
        borderLeft: "2px solid",
        borderLeftColor: "primary.500",
      }}
    >
      <Box
        as="span"
        css={{
          display: "block",
          mb: "2",
          color: "pageMuted",
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

      {action && onAction && !errorMessage && (
        <Box css={{ mt: "3" }}>
          <Button
            size="sm"
            onMouseDown={(event: MouseEvent) => event.preventDefault()}
            onClick={() => onAction(action)}
            css={{ fontFamily: "mono" }}
          >
            go to {action.title} →
          </Button>
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
            color: "pageMuted",
            fontFamily: "mono",
            fontSize: "sm",
          }}
        >
          <Box as="span" css={{ textTransform: "uppercase" }}>
            sources
          </Box>
          {sources.map((source, index) => (
            <Link key={source.href} href={source.href} onClick={onSourceClick}>
              [{index + 1}] {source.title}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}
