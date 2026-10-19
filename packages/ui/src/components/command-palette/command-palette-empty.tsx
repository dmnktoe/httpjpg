"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";
import { Button } from "../button/button";

interface CommandPaletteEmptyProps {
  query: string;
  canAsk: boolean;
  onAsk: () => void;
}

/** No matches is a dead end unless it points somewhere: the assistant reads the same pages. */
export function CommandPaletteEmpty({ query, canAsk, onAsk }: CommandPaletteEmptyProps) {
  return (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3",
        px: "4",
        py: "6",
        color: "pageMuted",
        fontFamily: "mono",
        fontSize: "sm",
        textAlign: "center",
      }}
    >
      <Box as="span" aria-hidden="true">
        (·_·)
      </Box>
      <Box as="span">no matches for “{query}”</Box>
      {canAsk && (
        <Button
          size="sm"
          variant="secondary"
          onMouseDown={(event: MouseEvent) => event.preventDefault()}
          onClick={onAsk}
          css={{ fontFamily: "mono" }}
        >
          ask instead ⌘↵
        </Button>
      )}
    </Box>
  );
}
