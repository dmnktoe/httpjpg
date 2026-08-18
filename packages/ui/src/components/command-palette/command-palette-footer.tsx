"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";
import { Button } from "../button/button";

interface CommandPaletteFooterProps {
  statusLabel: string;
  canAsk: boolean;
  onAsk: () => void;
}

export function CommandPaletteFooter({ statusLabel, canAsk, onAsk }: CommandPaletteFooterProps) {
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
        {statusLabel}
      </Box>
      {canAsk && (
        <Button
          size="sm"
          // mousedown only guards the input's focus; Enter and Space dispatch
          // click, so the action itself has to hang off onClick.
          onMouseDown={(event: MouseEvent) => event.preventDefault()}
          onClick={onAsk}
          css={{ flexShrink: 0, fontFamily: "mono" }}
        >
          ask ⌘↵
        </Button>
      )}
    </Box>
  );
}
