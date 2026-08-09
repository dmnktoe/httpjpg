"use client";

import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import { Box } from "../box/box";

interface CommandPaletteInputProps {
  value: string;
  placeholder: string;
  inputRef: RefObject<HTMLInputElement | null>;
  activeDescendantId?: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function CommandPaletteInput({
  value,
  placeholder,
  inputRef,
  activeDescendantId,
  onChange,
  onKeyDown,
}: CommandPaletteInputProps) {
  return (
    <Box
      css={{
        display: "flex",
        alignItems: "center",
        gap: "3",
        px: "4",
        py: "3",
        borderColor: "pageBorder",
        borderBottom: "1px solid",
      }}
    >
      <Box as="span" aria-hidden="true" css={{ opacity: 0.5, fontFamily: "mono", fontSize: "sm" }}>
        &gt;
      </Box>
      <Box
        as="input"
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        // This *is* the input the rule asks for; ARIA 1.2 puts `combobox` on it
        // to bind the text field to the listbox below.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="combobox"
        aria-expanded="true"
        aria-controls="command-palette-results"
        aria-autocomplete="list"
        aria-activedescendant={activeDescendantId}
        autoComplete="off"
        spellCheck={false}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        css={{
          flex: "1",
          color: "pageFg",
          fontFamily: "mono",
          fontSize: "md",
          bg: "transparent",
          border: "none",
          outline: "none",
          _placeholder: { color: "pageFg", opacity: 0.4 },
        }}
      />
      <Box
        as="kbd"
        css={{
          px: "1.5",
          py: "0.5",
          opacity: 0.6,
          fontFamily: "mono",
          fontSize: "sm",
          border: "1px solid",
          borderColor: "pageBorder",
        }}
      >
        ESC
      </Box>
    </Box>
  );
}
