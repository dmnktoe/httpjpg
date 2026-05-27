"use client";

import { forwardRef, useCallback, useState } from "react";
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

  const handleCopy = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [code]);

  const lines = code.split("\n");

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
            color: "neutral.400",
          })}
        >
          <span>{filename || language}</span>
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
                borderColor: "neutral.600",
                color: "neutral.200",
                fontSize: "xs",
                fontFamily: "mono",
                _hover: { bg: "neutral.800", borderColor: "neutral.500" },
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
                    color: "neutral.600",
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
