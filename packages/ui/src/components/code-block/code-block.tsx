"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  className?: string;
  css?: SystemStyleObject;
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  { code, language, filename, showLineNumbers, copyable = true, className, css: cssProp },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
      resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [code]);

  const lines = code.split("\n");

  // CodeBlock stays dark in both light/dark themes — terminal/editor convention.
  // Four shades only: bg (950), header bg (900), border + muted (700), text (100).
  return (
    <div
      ref={ref}
      className={cx(
        css({
          position: "relative",
          my: "4",
          color: "neutral.100",
          fontFamily: "mono",
          fontSize: "sm",
          lineHeight: "snug",
          bg: "neutral.950",
          border: "2px solid",
          borderColor: "pageFg",
          overflow: "hidden",
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      {(filename || language || copyable) && (
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "3",
            px: "4",
            py: "2",
            color: "neutral.100",
            fontSize: "xs",
            letterSpacing: "wider",
            textTransform: "uppercase",
            bg: "neutral.900",
            borderColor: "neutral.700",
            borderBottom: "1px solid",
          })}
        >
          <span>
            {filename || language}
            {filename && language && (
              <span className={css({ ml: "2", opacity: 0.5 })}>╱╱ {language}</span>
            )}
          </span>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy code"
              className={css({
                boxSizing: "border-box",
                px: "2",
                py: "1",
                color: "neutral.100",
                fontFamily: "mono",
                fontSize: "xs",
                border: "1px solid",
                borderColor: "neutral.700",
                cursor: "pointer",
                all: "unset",
                _hover: { bg: "neutral.900", borderColor: "neutral.100" },
                _focusVisible: {
                  outline: "1px solid",
                  outlineColor: "primary.500",
                  outlineOffset: "1px",
                },
              })}
            >
              {copied ? "copied!" : "copy"}
            </button>
          )}
        </div>
      )}
      <pre className={css({ margin: 0, padding: "4", whiteSpace: "pre", overflow: "auto" })}>
        {showLineNumbers ? (
          <code>
            {lines.map((line, idx) => (
              <span key={`${idx}-${line}`} className={css({ display: "block" })}>
                <span
                  className={css({
                    display: "inline-block",
                    width: "8",
                    pr: "3",
                    color: "neutral.700",
                    textAlign: "right",
                    userSelect: "none",
                  })}
                >
                  {idx + 1}
                </span>
                {line || " "}
              </span>
            ))}
          </code>
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";
