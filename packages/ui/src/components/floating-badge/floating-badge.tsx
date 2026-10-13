"use client";

import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { useHasMounted } from "../../lib/use-has-mounted";
import { parseWorkAccent, workAccentCssVars } from "../../lib/work-accent";

const MOBILE_SIZE = 40;
const DESKTOP_HEIGHT = 32;
const BACKDROP_FILTER = "blur(20px) saturate(180%)";

/**
 * One pill. `href` → link, `onClick` → button, `status` → `<output>`.
 * `label` shows from `sm` up; mobile shows only the glyph.
 */
export interface FloatingBadgeAction {
  /** Stable React key and accessible name. */
  ariaLabel: string;
  label: string;
  glyph: string;
  href?: string;
  onClick?: () => void;
  /** Toggle state for `onClick` pills (`aria-pressed`). Keep `ariaLabel` stable. */
  pressed?: boolean;
  /** Default: true when `href` is http(s). */
  external?: boolean;
  /** Non-interactive status pill, rendered as `<output>`. */
  status?: boolean;
  /** Tint this pill with the badge `accentColor`. */
  accented?: boolean;
}

export interface FloatingBadgeProps {
  actions?: FloatingBadgeAction[];
  /** Applied only to pills with `accented`. Editor tools stay on the default glass. */
  accentColor?: string | null;
  css?: SystemStyleObject;
  className?: string;
  style?: CSSProperties;
}

const SHEEN_GRADIENT =
  "linear-gradient(165deg, color-mix(in srgb, var(--work-accent, #ffffff) 36%, transparent) 0%, color-mix(in srgb, var(--work-accent, #ffffff) 8%, transparent) 40%, rgba(0, 0, 0, 0.16) 100%)";

const pillClass = css({
  position: "relative",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  width: `${MOBILE_SIZE}px`,
  height: `${MOBILE_SIZE}px`,
  color: "var(--work-on-accent, white)",
  fontFamily: "mono",
  fontSize: "sm",
  fontWeight: "normal",
  lineHeight: "none",
  letterSpacing: "wider",
  textDecoration: "none",
  whiteSpace: "nowrap",
  backgroundColor: "var(--work-accent-fill, rgba(0, 0, 0, 0.32))",
  border: "1px solid var(--work-accent, rgba(255, 255, 255, 0.28))",
  borderRadius: "full",
  boxShadow:
    "0 8px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.30), inset 0 -1px 0 0 rgba(0, 0, 0, 0.25)",
  transition:
    "transform 150ms ease-out, box-shadow 200ms ease-out, background-color 200ms ease-out, border-color 200ms ease-out",
  appearance: "none",
  cursor: "pointer",
  overflow: "hidden",
  isolation: "isolate",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.6), 0 0 6px rgba(0, 0, 0, 0.3)",
  sm: { width: "fit-content", height: `${DESKTOP_HEIGHT}px`, paddingInline: "4" },
  _after: {
    position: "absolute",
    inset: "0",
    content: '""',
    opacity: 0.85,
    backgroundImage: SHEEN_GRADIENT,
    borderRadius: "inherit",
    transition: "opacity 200ms ease-out",
    pointerEvents: "none",
  },
  _hover: {
    backgroundColor: "var(--work-accent-fill-hover, rgba(0, 0, 0, 0.42))",
    borderColor: "var(--work-accent, rgba(255, 255, 255, 0.45))",
    boxShadow:
      "0 12px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.40), inset 0 -1px 0 0 rgba(0, 0, 0, 0.25)",
    transform: "translateY(-1px)",
    _after: { opacity: 1 },
  },
  _active: { transform: "translateY(1px)" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
});

const contentClass = css({
  position: "relative",
  zIndex: 1,
  display: "inline-flex",
  alignItems: "center",
});

const pressedClass = css({
  backgroundColor: "var(--work-accent-fill-hover, rgba(0, 0, 0, 0.42))",
  borderColor: "var(--work-accent, rgba(255, 255, 255, 0.55))",
});

const statusClass = css({
  cursor: "default",
  _hover: { boxShadow: "inherit", transform: "none" },
  _active: { transform: "none" },
});

const glyphClass = css({
  display: "inline-block",
  fontSize: "1.4em",
  lineHeight: "1",
  verticalAlign: "middle",
});

const labelClass = css({
  display: "none",
  sm: { display: "inline" },
});

/** Portalled glass pill row, bottom center. `accentColor` tints only `accented` pills. */
export const FloatingBadge = forwardRef<HTMLDivElement, FloatingBadgeProps>(function FloatingBadge(
  { actions, accentColor, className, css: cssProp, style },
  ref,
) {
  const mounted = useHasMounted();

  if (!mounted) {
    return null;
  }

  if (!actions?.length) {
    return null;
  }

  return createPortal(
    <div
      ref={ref}
      data-floating-badge=""
      style={style}
      className={cx(
        css({
          position: "fixed",
          right: "0",
          bottom: "12",
          left: "0",
          zIndex: "previewBadge",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2",
          pointerEvents: "none",
          "& > *": { pointerEvents: "auto" },
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      {actions.map((action) => (
        <BadgePill key={action.ariaLabel} action={action} accentColor={accentColor} />
      ))}
    </div>,
    document.body,
  );
});

FloatingBadge.displayName = "FloatingBadge";

interface BadgePillProps {
  action: FloatingBadgeAction;
  accentColor?: string | null;
}

function BadgePill({ action, accentColor }: BadgePillProps) {
  const accentVars = action.accented ? workAccentCssVars(parseWorkAccent(accentColor)) : undefined;

  const shared = {
    className: cx(pillClass, action.pressed && pressedClass, action.status && statusClass),
    style: {
      backdropFilter: BACKDROP_FILTER,
      WebkitBackdropFilter: BACKDROP_FILTER,
      ...accentVars,
    } as CSSProperties,
    "aria-label": action.ariaLabel,
    title: action.ariaLabel,
    "aria-pressed": action.pressed,
  };

  const inner = (
    <span className={contentClass}>
      <span className={labelClass}>{`${action.label} `}</span>
      <span aria-hidden="true" className={glyphClass}>
        {action.glyph}
      </span>
    </span>
  );

  if (action.status) {
    return <output {...shared}>{inner}</output>;
  }

  if (action.href) {
    const external = action.external ?? /^https?:\/\//i.test(action.href);
    return (
      <a
        href={action.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...shared}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={action.onClick} {...shared}>
      {inner}
    </button>
  );
}
