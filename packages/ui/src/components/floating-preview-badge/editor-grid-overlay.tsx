import { css } from "styled-system/css";

/** Full-viewport 12-col guide. Pointer-events none so editors still click through. */
export function EditorGridOverlay() {
  return (
    <div
      aria-hidden="true"
      data-editor-grid=""
      className={css({
        position: "fixed",
        inset: "0",
        zIndex: "overlay",
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "4",
        paddingInline: { base: "4", md: "6", lg: "8" },
        pointerEvents: "none",
      })}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className={css({
            position: "relative",
            height: "100%",
            opacity: 0.06,
            backgroundColor: "pageFg",
            _pageDark: { opacity: 0.1 },
          })}
        >
          <span
            className={css({
              position: "sticky",
              top: "3",
              display: "block",
              color: "pageFg",
              opacity: 0.55,
              fontFamily: "mono",
              fontSize: "xs",
              letterSpacing: "wider",
              textAlign: "center",
            })}
          >
            {`[ ${String(index + 1).padStart(2, "0")} ]`}
          </span>
        </div>
      ))}
    </div>
  );
}
