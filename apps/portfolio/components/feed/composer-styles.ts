import { css } from "styled-system/css";

export const fieldClass = css({
  boxSizing: "border-box",
  w: "full",
  px: "2",
  py: "2",
  color: "pageFg",
  fontFamily: "mono",
  fontSize: "sm",
  lineHeight: "snug",
  bg: "pageBg",
  border: "1px solid",
  borderColor: "pageFg",
  borderRadius: "0",
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
});

export const labelClass = css({
  display: "flex",
  flexDirection: "column",
  gap: "1",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "wider",
});

export const buttonClass = css({
  boxSizing: "border-box",
  px: "3",
  py: "2",
  fontFamily: "mono",
  fontSize: "sm",
  lineHeight: 1,
  border: "1px solid",
  borderColor: "pageFg",
  cursor: "pointer",
  userSelect: "none",
  all: "unset",
  _hover: { color: "pageBg", bg: "pageFg" },
  _disabled: { opacity: 0.5, cursor: "progress" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
  "&[aria-pressed=true]": { color: "pageBg", bg: "pageFg" },
  "&[data-tone=danger]": { color: "danger.500", borderColor: "danger.500" },
  "&[data-tone=danger]:hover": { color: "white", bg: "danger.500" },
});

export const hintClass = css({ m: 0, opacity: 0.6, fontFamily: "mono", fontSize: "xs" });

export const errorClass = css({ m: 0, color: "danger.500", fontFamily: "mono", fontSize: "xs" });
