import { css } from "styled-system/css";

const BRACKET_CLASS = css({
  position: "absolute",
  zIndex: "docked",
  color: "white",
  fontFamily: "mono",
  fontSize: "lg",
  lineHeight: 1,
  transition:
    "opacity 120ms cubic-bezier(.35, 0, 0, 1), transform 200ms cubic-bezier(.35, 0, 0, 1)",
  pointerEvents: "none",
  userSelect: "none",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
});

const CORNERS = [
  { glyph: "┌", top: true, left: true },
  { glyph: "┐", top: true, left: false },
  { glyph: "└", top: false, left: true },
  { glyph: "┘", top: false, left: false },
] as const;

export function ScrollClipImageBrackets() {
  return (
    <>
      {CORNERS.map(({ glyph, top, left }) => (
        <span
          key={glyph}
          aria-hidden="true"
          className={BRACKET_CLASS}
          style={{
            [top ? "top" : "bottom"]: "calc(var(--clip-ratio, 0%) + 6px)",
            [left ? "left" : "right"]: "calc(var(--clip-ratio, 0%) + 6px)",
          }}
        >
          {glyph}
        </span>
      ))}
    </>
  );
}
