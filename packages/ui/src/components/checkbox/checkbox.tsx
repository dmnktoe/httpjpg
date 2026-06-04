"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useId } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

/** Tribal mark painted between the brackets when checked (U+25C6 BLACK DIAMOND). */
const TRIBAL_MARK = "◆";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  /** Inline label rendered to the right of the box. */
  label?: ReactNode;
  /** Glyph painted between the brackets when checked. @default "◆" */
  marker?: string;
  id?: string;
  name?: string;
  value?: string;
  className?: string;
  css?: SystemStyleObject;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled = false,
  required = false,
  label,
  marker = TRIBAL_MARK,
  id,
  name,
  value,
  className,
  css: cssProp,
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (disabled) return;
    onCheckedChange?.(event.target.checked);
  }

  return (
    <label
      htmlFor={inputId}
      className={cx(
        css({
          display: "inline-flex",
          alignItems: "center",
          gap: "2",
          fontFamily: "mono",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          userSelect: "none",
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={handleChange}
        className={cx(
          "peer",
          css({
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            border: 0,
            clipPath: "inset(50%)",
          }),
        )}
      />
      <span
        aria-hidden="true"
        className={css({
          flexShrink: 0,
          fontFamily: "mono",
          fontSize: "1em",
          lineHeight: 1,
          whiteSpace: "pre",
          letterSpacing: "normal",
          _peerFocusVisible: {
            outline: "2px solid",
            outlineColor: "primary.500",
            outlineOffset: "2px",
            borderRadius: "2px",
          },
        })}
      >
        <span className={css({ opacity: 0.5 })}>‹</span>
        <span
          className={css({
            display: "inline-block",
            width: "1ch",
            textAlign: "center",
            color: "accent.500",
            transition: "color 150ms ease",
          })}
        >
          {checked ? marker : " "}
        </span>
        <span className={css({ opacity: 0.5 })}>›</span>
      </span>
      {label != null && <span className={css({ fontSize: "1em", lineHeight: 1.4 })}>{label}</span>}
    </label>
  );
}

Checkbox.displayName = "Checkbox";
