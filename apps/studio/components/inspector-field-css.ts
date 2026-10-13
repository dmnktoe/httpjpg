import { css } from "styled-system/css";

export const labelCss = css({ display: "flex", flexDirection: "column", gap: 1 });
export const fieldInline = {
  padding: 1,
  border: "1px solid",
  borderColor: "pageBorder",
  bg: "pageBg",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
} as const;
export const fieldCss = css({ width: "100%", ...fieldInline });
