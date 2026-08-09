"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";

import { useBodyScrollLock } from "../../lib/use-body-scroll-lock";
import { Box } from "../box/box";
import { Button } from "../button/button";
import { CommandPaletteAnswer, type CommandPaletteSource } from "./command-palette-answer";
import { CommandPaletteInput } from "./command-palette-input";
import { type CommandPaletteResult, CommandPaletteResultItem } from "./command-palette-result";
import { CommandPaletteSuggestions } from "./command-palette-suggestions";

export type { CommandPaletteResult, CommandPaletteSource };

/** Wide enough for a three-sentence answer, narrow enough to stay scannable. */
const MAX_WIDTH = "640px";

/** Tab stops the trap cycles between. Result rows are reached with the arrows. */
const FOCUSABLE_SELECTOR = 'a[href], button, input, [tabindex]:not([tabindex="-1"])';

/** Enter is a touch slower than exit, so dismissing feels immediate. */
const ENTER_TRANSITION = { duration: 0.18, ease: [0.16, 1, 0.3, 1] } as const;
const EXIT_TRANSITION = { duration: 0.12, ease: "easeIn" } as const;

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
  const prefersReducedMotion = useReducedMotion();

  useBodyScrollLock(open);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const resultKey = results.map((result) => result.id).join("|");
  useEffect(() => {
    setActiveIndex(0);
  }, [resultKey]);

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

  if (!isMounted) {
    return null;
  }

  const hasAnswer = Boolean(answer) || status === "answering" || status === "error";
  const isStreaming = status === "answering";
  const canAsk = askEnabled && query.trim().length > 0;

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

  // Reduced motion keeps the fade — it carries no movement — but drops the
  // lift and the scale, which are the parts that read as motion.
  const dialogEnter = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };
  const dialogFrom = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 };
  const dialogExit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.99 };

  const palette = (
    <AnimatePresence>
      {open && (
        <m.div
          key="command-palette-backdrop"
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: EXIT_TRANSITION }}
          transition={ENTER_TRANSITION}
          style={{ WebkitBackdropFilter: "blur(12px)" }}
          className={css({
            position: "fixed",
            inset: "0",
            zIndex: "commandPalette",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            px: "4",
            pt: { base: "16", md: "24" },
            pb: { base: "4", md: "24" },
            bg: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(12px)",
          })}
        >
          <m.div
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="dialog"
            aria-modal="true"
            aria-label="Search and ask"
            ref={dialogRef}
            onKeyDown={handleDialogKeyDown}
            onMouseDown={(event: MouseEvent) => event.stopPropagation()}
            initial={dialogFrom}
            animate={dialogEnter}
            exit={{ ...dialogExit, transition: EXIT_TRANSITION }}
            transition={ENTER_TRANSITION}
            className={css({
              w: "full",
              maxW: MAX_WIDTH,
              maxH: "min(70dvh, 100%)",
              color: "pageFg",
              bg: "pageBg",
              border: "1px solid",
              borderColor: "pageBorder",
              boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.35)",
              overflowY: "auto",
              overscrollBehavior: "contain",
            })}
          >
            <CommandPaletteInput
              value={query}
              placeholder={placeholder}
              inputRef={inputRef}
              activeDescendantId={results[activeIndex] ? optionId(activeIndex) : undefined}
              onChange={onQueryChange}
              onClear={() => {
                onQueryChange("");
                inputRef.current?.focus();
              }}
              onKeyDown={handleKeyDown}
            />

            <CommandPaletteSuggestions suggestions={suggestions} onSelect={onQueryChange} />

            {hasAnswer && (
              <CommandPaletteAnswer
                answer={answer}
                sources={sources}
                isStreaming={isStreaming}
                onSourceClick={onClose}
                errorMessage={
                  status === "error" ? (errorMessage ?? "The answer failed.") : undefined
                }
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
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
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
      <Box as="span" css={{ color: "pageMuted" }}>
        {statusLabel(status, query, resultCount)}
      </Box>
      {canAsk && (
        <Button
          size="sm"
          // mousedown only guards the input's focus; Enter and Space dispatch
          // click, so the action itself has to hang off onClick.
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
