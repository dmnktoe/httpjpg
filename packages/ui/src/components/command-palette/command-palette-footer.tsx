"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";
import { Button } from "../button/button";
import type { CommandPaletteStatus } from "./command-palette";

interface CommandPaletteFooterProps {
  query: string;
  status: CommandPaletteStatus;
  resultCount: number;
  canAsk: boolean;
  onAsk: (question: string) => void;
}

export function CommandPaletteFooter({
  query,
  status,
  resultCount,
  canAsk,
  onAsk,
}: CommandPaletteFooterProps) {
  return (
    <Box
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "3",
        px: "4",
        py: "2",
        fontFamily: "mono",
        fontSize: "sm",
        borderColor: "pageBorder",
        borderTop: "1px solid",
      }}
    >
      <Box as="span" css={{ color: "pageMuted" }}>
        {statusLabel(status, query, resultCount)}
      </Box>
      {canAsk && (
        <Button
          size="sm"
          onMouseDown={(event: MouseEvent) => event.preventDefault()}
          onClick={() => onAsk(query.trim())}
          css={{ flexShrink: 0, fontFamily: "mono" }}
        >
          ask ⌘↵
        </Button>
      )}
    </Box>
  );
}

function statusLabel(status: CommandPaletteStatus, query: string, resultCount: number): string {
  if (status === "searching") {
    return "searching…";
  }
  if (status === "answering") {
    return "thinking…";
  }
  if (!query.trim()) {
    return "type to search";
  }
  if (resultCount === 0) {
    return "no matches";
  }
  return `${resultCount} ${resultCount === 1 ? "match" : "matches"}`;
}
