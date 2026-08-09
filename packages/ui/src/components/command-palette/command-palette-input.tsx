"use client";

import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import { Box } from "../box/box";

interface CommandPaletteInputProps {
  value: string;
  placeholder: string;
  inputRef: RefObject<HTMLInputElement | null>;
  activeDescendantId?: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function CommandPaletteInput({
  value,
  placeholder,
  inputRef,
  activeDescendantId,
  onChange,
  onClear,
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
        borderColor: "primary.500",
        borderBottom: "2px solid",
      }}
    >
      <Box
        as="span"
        aria-hidden="true"
        css={{ color: "accentFg", fontFamily: "mono", fontSize: "md", fontWeight: "bold" }}
      >
        &gt;
      </Box>
      <Box
        as="input"
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
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
          minW: 0,
          color: "pageFg",
          fontFamily: "mono",
          fontSize: "md",
          bg: "transparent",
          border: "none",
          outline: "none",
          caretColor: "primary.500",
          _placeholder: { color: "pageMuted", opacity: 0.7 },
        }}
      />
      {value && (
        <Box
          as="button"
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          css={{
            display: "flex",
            flexShrink: 0,
            justifyContent: "center",
            alignItems: "center",
            w: "6",
            h: "6",
            color: "pageMuted",
            fontFamily: "mono",
            fontSize: "md",
            lineHeight: "none",
            bg: "transparent",
            border: "none",
            cursor: "pointer",
            _hover: { color: "pageBg", bg: "primary.500" },
            _focusVisible: { outline: "2px solid", outlineColor: "primary.500" },
          }}
        >
          ×
        </Box>
      )}
      <Box
        as="kbd"
        css={{
          flexShrink: 0,
          px: "1.5",
          py: "0.5",
          color: "primary.500",
          fontFamily: "mono",
          fontSize: "sm",
          border: "1px solid",
          borderColor: "primary.500",
        }}
      >
        ESC
      </Box>
    </Box>
  );
}
