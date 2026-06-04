"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useId } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

/** Tribal ASCII wave shown when the box is checked (U+224B TRIPLE TILDE). */
const WAVE_MARK = "≋";

const sizeStyles = {
  sm: { box: "5", font: "sm", mark: "xs" },
  md: { box: "6", font: "md", mark: "sm" },
} as const;

type CheckboxSize = keyof typeof sizeStyles;

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  /** Inline label rendered to the right of the box. */
  label?: ReactNode;
  /** Glyph painted inside the box when checked. @default "≋" */
  marker?: string;
  size?: CheckboxSize;
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
  marker = WAVE_MARK,
  size = "md",
  id,
  name,
  value,
  className,
  css: cssProp,
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const dims = sizeStyles[size];

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
          gap: "2.5",
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
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          w: dims.box,
          h: dims.box,
          fontSize: dims.mark,
          lineHeight: 1,
          fontWeight: "bold",
          letterSpacing: "tighter",
          border: "2px solid",
          borderColor: checked ? "accent.500" : "pageBorder",
          color: "accent.500",
          bg: checked ? "accent.500/10" : "transparent",
          transition: "border-color 150ms ease, background-color 150ms ease",
          "label:hover &": disabled ? {} : { borderColor: "pageFg" },
          _peerFocusVisible: {
            outline: "2px solid",
            outlineColor: "primary.500",
            outlineOffset: "2px",
          },
        })}
      >
        {checked ? marker : ""}
      </span>
      {label != null && (
        <span className={css({ fontSize: dims.font, lineHeight: 1.4 })}>{label}</span>
      )}
    </label>
  );
}

Checkbox.displayName = "Checkbox";
