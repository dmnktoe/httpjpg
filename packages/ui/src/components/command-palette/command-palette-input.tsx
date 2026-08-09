"use client";

import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import { Box } from "../box/box";
import { IconButton } from "../icon-button/icon-button";

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
        borderColor: "pageBorder",
        borderBottom: "1px solid",
      }}
    >
      <Box
        as="span"
        aria-hidden="true"
        css={{ color: "primary.500", fontFamily: "mono", fontSize: "md" }}
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
        <IconButton
          icon="close"
          iconSize="14px"
          size="sm"
          variant="ghost"
          aria-label="Clear search"
          onClick={onClear}
          css={{
            flexShrink: 0,
            color: "pageMuted",
            // The shared ghost variant fades on hover, which reads as the
            // control disappearing. Here it sharpens instead.
            _hover: { color: "pageFg", opacity: 1 },
          }}
        />
      )}
      <Box
        as="kbd"
        css={{
          flexShrink: 0,
          px: "1.5",
          py: "0.5",
          color: "pageMuted",
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
