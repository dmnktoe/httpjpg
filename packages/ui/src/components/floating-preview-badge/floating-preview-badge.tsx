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
function desktopPrefix(label: string): string {
  return `(っ◔◡◔)っ ♥ ${label} •°*“˜.•°*“˜ `;
}
const BACKDROP_FILTER = "blur(20px) saturate(180%)";

export interface FloatingBadgeAction {
  href?: string;
  onClick?: () => void;
  label: string;
  glyph: string;
  ariaLabel: string;
  pressed?: boolean;
  /** Default: true when `href` is http(s). Same-origin routes (exit draft) set false. */
  external?: boolean;
  /** Hide inside the Storyblok Visual Editor iframe (e.g. exit-draft). */
  hideInIframe?: boolean;
  /** Status pill (draft). Renders an `output`, not a control. */
  presentational?: boolean;
  /** Tint this pill with the badge `accentColor`. Preview only — editor tools stay neutral. */
  accented?: boolean;
}

export interface FloatingPreviewBadgeProps {
  /** Work-page live URL. Content-owned; omit when the story has no external link. */
  href?: string;
  label?: string;
  actions?: FloatingBadgeAction[];
  /** Work page Project Accent Color. Applied only to the preview pill, not the cluster. */
  accentColor?: string | null;
  css?: SystemStyleObject;
  className?: string;
  style?: CSSProperties;
}

const pillClass = css({
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
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.6), 0 0 6px rgba(0, 0, 0, 0.3)",
  sm: { width: "fit-content", height: `${DESKTOP_HEIGHT}px`, paddingInline: "4" },
  _hover: {
    backgroundColor: "var(--work-accent-fill-hover, rgba(0, 0, 0, 0.42))",
    borderColor: "var(--work-accent, rgba(255, 255, 255, 0.45))",
    boxShadow:
      "0 12px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.40), inset 0 -1px 0 0 rgba(0, 0, 0, 0.25)",
    transform: "translateY(-1px)",
  },
  _active: { transform: "translateY(1px)" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
});

const pressedClass = css({
  backgroundColor: "var(--work-accent-fill-hover, rgba(0, 0, 0, 0.42))",
  borderColor: "var(--work-accent, rgba(255, 255, 255, 0.55))",
});

const presentationalClass = css({
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

/** Dumb pill cluster. Preview URL is `href`; editor chrome is composed by `EditorChrome`. */
export const FloatingPreviewBadge = forwardRef<HTMLDivElement, FloatingPreviewBadgeProps>(
  function FloatingPreviewBadge(
    { href, label = "preview", actions, accentColor, className, css: cssProp, style },
    ref,
  ) {
    const mounted = useHasMounted();

    if (!mounted) {
      return null;
    }

    const inIframe = window.self !== window.top;
    const extra = (actions ?? []).filter((action) => !(action.hideInIframe && inIframe));
    const hasPreview = Boolean(href);
    if (!hasPreview && extra.length === 0) {
      return null;
    }

    const pills: FloatingBadgeAction[] = [
      ...(hasPreview && href
        ? [
            {
              href,
              label,
              glyph: "↗",
              ariaLabel: `${label} — open external preview`,
              accented: true,
            } satisfies FloatingBadgeAction,
          ]
        : []),
      ...extra,
    ];

    return createPortal(
      <div
        ref={ref}
        data-page-badge=""
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
        {pills.map((action) => (
          <BadgePill
            key={action.ariaLabel}
            action={action}
            accentColor={accentColor}
            kawaii={action.glyph === "↗"}
          />
        ))}
      </div>,
      document.body,
    );
  },
);

function BadgePill({
  action,
  accentColor,
  kawaii,
}: {
  action: FloatingBadgeAction;
  accentColor?: string | null;
  kawaii: boolean;
}) {
  const accentVars = action.accented ? workAccentCssVars(parseWorkAccent(accentColor)) : undefined;

  const shared = {
    className: cx(
      pillClass,
      action.pressed && pressedClass,
      action.presentational && presentationalClass,
    ),
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
    <>
      <span className={labelClass}>
        {kawaii ? desktopPrefix(action.label) : `${action.label} `}
      </span>
      <span aria-hidden="true" className={glyphClass}>
        {action.glyph}
      </span>
    </>
  );

  if (action.presentational) {
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
