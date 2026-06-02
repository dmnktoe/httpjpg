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
          border: "2px solid",
          borderColor: "pageFg",
          bg: "neutral.950",
          color: "neutral.100",
          fontFamily: "mono",
          fontSize: "sm",
          lineHeight: "snug",
          overflow: "hidden",
          my: "4",
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      {(filename || language || copyable) && (
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "3",
            px: "4",
            py: "2",
            borderBottom: "1px solid",
            borderColor: "neutral.700",
            bg: "neutral.900",
            fontSize: "xs",
            textTransform: "uppercase",
            letterSpacing: "wider",
            color: "neutral.100",
          })}
        >
          <span>
            {filename || language}
            {filename && language && (
              <span className={css({ opacity: 0.5, ml: "2" })}>╱╱ {language}</span>
            )}
          </span>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy code"
              className={css({
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                px: "2",
                py: "1",
                border: "1px solid",
                borderColor: "neutral.700",
                color: "neutral.100",
                fontSize: "xs",
                fontFamily: "mono",
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
      <pre
        className={css({
          margin: 0,
          padding: "4",
          overflow: "auto",
          whiteSpace: "pre",
        })}
      >
        {showLineNumbers ? (
          <code>
            {lines.map((line, idx) => (
              <span key={`${idx}-${line}`} className={css({ display: "block" })}>
                <span
                  className={css({
                    display: "inline-block",
                    width: "8",
                    color: "neutral.700",
                    textAlign: "right",
                    pr: "3",
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
