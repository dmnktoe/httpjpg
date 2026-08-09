"use client";

import { zIndex } from "@httpjpg/tokens";
import type { KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Box } from "../box/box";
import { CommandPaletteAnswer, type CommandPaletteSource } from "./command-palette-answer";
import { CommandPaletteInput } from "./command-palette-input";
import { type CommandPaletteResult, CommandPaletteResultItem } from "./command-palette-result";
import { CommandPaletteSuggestions } from "./command-palette-suggestions";

export type { CommandPaletteResult, CommandPaletteSource };

/** Wide enough for a three-sentence answer, narrow enough to stay scannable. */
const MAX_WIDTH = "640px";

/** Tab stops the trap cycles between. Result rows are reached with the arrows. */
const FOCUSABLE_SELECTOR = 'a[href], button, input, [tabindex]:not([tabindex="-1"])';

/** `answering` keeps the caret blinking; `error` swaps the answer for a message. */
export type CommandPaletteStatus = "idle" | "searching" | "answering" | "error";

export interface CommandPaletteProps {
  open: boolean;
  query: string;
  results: CommandPaletteResult[];
  suggestions?: string[];
  /** The answer text so far. Grows token by token while status is `answering`. */
  answer?: string;
  sources?: CommandPaletteSource[];
  status?: CommandPaletteStatus;
  errorMessage?: string;
  /** Hides the "ask" affordance when the deployment has no AI key. @default true */
  askEnabled?: boolean;
  placeholder?: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onSelect: (result: CommandPaletteResult) => void;
  onAsk: (question: string) => void;
}

export function CommandPalette({
  open,
  query,
  results,
  suggestions = [],
  answer = "",
  sources = [],
  status = "idle",
  errorMessage,
  askEnabled = true,
  placeholder = "search or ask a question…",
  onQueryChange,
  onClose,
  onSelect,
  onAsk,
}: CommandPaletteProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // A new result set invalidates the old highlight position. Keyed on the ids
  // rather than the array: the parent rebuilds the array on every render, and
  // depending on its identity would reset the highlight mid-keyboard-navigation.
  const resultKey = results.map((result) => result.id).join("|");
  useEffect(() => {
    setActiveIndex(0);
  }, [resultKey]);

  // Take focus on open and hand it back on close, so dismissing the palette
  // returns the caret to the header button that summoned it rather than the
  // top of the document.
  // Depends on isMounted too: the first render returns null while the portal
  // waits for the client, so the input does not exist yet on a palette that is
  // mounted already open.
  useEffect(() => {
    if (!open || !isMounted) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, [open, isMounted]);

  // The palette covers the page, so the page behind it must not scroll away.
  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !isMounted) {
    return null;
  }

  const hasAnswer = Boolean(answer) || status === "answering" || status === "error";
  const isStreaming = status === "answering";
  const canAsk = askEnabled && query.trim().length > 0;

  // Escape and Tab are handled for the whole dialog, not just the input: focus
  // can sit on a suggestion chip, a source link, or the ask button, and the
  // palette still has to dismiss and still has to keep Tab inside itself.
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }
    if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      // Cmd/Ctrl+Enter asks even when a result is highlighted, so the keyboard
      // can reach both actions without leaving the input.
      const forceAsk = event.metaKey || event.ctrlKey;
      const active = results[activeIndex];
      if (!forceAsk && active) {
        onSelect(active);
        return;
      }
      if (canAsk) {
        onAsk(query.trim());
      }
    }
  };

  const palette = (
    <Box
      // Clicking the backdrop dismisses; the dialog below stops propagation.
      onMouseDown={onClose}
      css={{
        position: "fixed",
        inset: "0",
        zIndex: zIndex.modal,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        px: "4",
        pt: { base: "16", md: "24" },
        bg: "rgba(0, 0, 0, 0.6)",
      }}
    >
      <Box
        // A native <dialog> would need showModal() and its own top-layer focus
        // trap; this is portalled and controlled, so the role carries it.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="dialog"
        aria-modal="true"
        aria-label="Search and ask"
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
        onMouseDown={(event: MouseEvent) => event.stopPropagation()}
        css={{
          w: "full",
          maxW: MAX_WIDTH,
          maxH: "70dvh",
          color: "pageFg",
          bg: "pageBg",
          border: "1px solid",
          borderColor: "pageFg",
          overflowY: "auto",
        }}
      >
        <CommandPaletteInput
          value={query}
          placeholder={placeholder}
          inputRef={inputRef}
          activeDescendantId={results[activeIndex] ? optionId(activeIndex) : undefined}
          onChange={onQueryChange}
          onKeyDown={handleKeyDown}
        />

        <CommandPaletteSuggestions suggestions={suggestions} onSelect={onQueryChange} />

        {hasAnswer && (
          <CommandPaletteAnswer
            answer={answer}
            sources={sources}
            isStreaming={isStreaming}
            errorMessage={status === "error" ? (errorMessage ?? "The answer failed.") : undefined}
          />
        )}

        {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
        <Box as="ul" id="command-palette-results" role="listbox" aria-label="Search results">
          {results.map((result, index) => (
            <CommandPaletteResultItem
              key={result.id}
              result={result}
              isActive={index === activeIndex}
              optionId={optionId(index)}
              onSelect={onSelect}
              onHover={() => setActiveIndex(index)}
            />
          ))}
        </Box>

        <CommandPaletteFooter
          query={query}
          status={status}
          resultCount={results.length}
          canAsk={canAsk}
          onAsk={onAsk}
        />
      </Box>
    </Box>
  );

  return createPortal(palette, document.body);
}

interface CommandPaletteFooterProps {
  query: string;
  status: CommandPaletteStatus;
  resultCount: number;
  canAsk: boolean;
  onAsk: (question: string) => void;
}

function CommandPaletteFooter({
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
      <Box as="span" css={{ opacity: 0.5 }}>
        {statusLabel(status, query, resultCount)}
      </Box>
      {canAsk && (
        <Box
          as="button"
          type="button"
          onMouseDown={(event: MouseEvent) => {
            event.preventDefault();
            onAsk(query.trim());
          }}
          css={{
            px: "2",
            py: "0.5",
            color: "pageFg",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "transparent",
            border: "1px solid",
            borderColor: "pageFg",
            cursor: "pointer",
            _hover: { color: "pageBg", bg: "pageFg" },
          }}
        >
          ask ⌘↵
        </Box>
      )}
    </Box>
  );
}

function optionId(index: number): string {
  return `command-palette-option-${index}`;
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
