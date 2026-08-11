import { css } from "styled-system/css";

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
