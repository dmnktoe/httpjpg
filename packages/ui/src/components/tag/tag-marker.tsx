import { css } from "styled-system/css";

/** The surviving `#` from the old mono chips, dimmed and hidden from screen readers. */
export function TagMarker() {
  return (
    <span
      aria-hidden="true"
      className={css({ opacity: 0.45, fontFamily: "mono", fontSize: "xs", userSelect: "none" })}
    >
      #
    </span>
  );
}
