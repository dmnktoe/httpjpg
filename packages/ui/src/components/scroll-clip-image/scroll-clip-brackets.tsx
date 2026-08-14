import { css } from "styled-system/css";

const BRACKETS = [
  { char: "┌", top: true, start: true },
  { char: "┐", top: true, start: false },
  { char: "└", top: false, start: true },
  { char: "┘", top: false, start: false },
] as const;

const bracketClass = css({
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

export function ScrollClipBrackets() {
  return (
    <>
      {BRACKETS.map(({ char, top, start }) => (
        <span
          key={char}
          aria-hidden="true"
          className={bracketClass}
          style={{
            [top ? "top" : "bottom"]: "calc(var(--clip-ratio, 0%) + 6px)",
            [start ? "left" : "right"]: "calc(var(--clip-ratio, 0%) + 6px)",
          }}
        >
          {char}
        </span>
      ))}
    </>
  );
}
