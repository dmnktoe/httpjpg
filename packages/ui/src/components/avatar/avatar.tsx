import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface AvatarProps {
  /** Shown as its first letter when there is no image. */
  name: string;
  src?: string;
  /** @default "sm" */
  size?: "sm" | "lg";
  /** Draws a turning ring around the image. */
  ring?: boolean;
  css?: SystemStyleObject;
}

const SIZE_CLASS = {
  sm: css({ w: "1.75rem", h: "1.75rem", fontSize: "xs" }),
  lg: css({
    w: { base: "4.5rem", md: "5.5rem" },
    h: { base: "4.5rem", md: "5.5rem" },
    fontSize: "2xl",
  }),
} as const;

const FACE_CLASS = css({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  w: "full",
  h: "full",
  color: "pageBg",
  fontFamily: "mono",
  fontWeight: "bold",
  lineHeight: 1,
  textTransform: "uppercase",
  bg: "pageFg",
  borderRadius: "full",
  overflow: "hidden",
  "&[data-ringed]": { outline: "0.1875rem solid", outlineColor: "pageBg" },
});

export function Avatar({ name, src, size = "sm", ring = false, css: cssProp }: AvatarProps) {
  return (
    <Box
      as="span"
      data-avatar=""
      className={SIZE_CLASS[size]}
      css={{
        position: "relative",
        display: "inline-flex",
        flexShrink: 0,
        borderRadius: "full",
        ...cssProp,
      }}
    >
      {ring && (
        <Box
          as="span"
          aria-hidden="true"
          data-avatar-ring=""
          css={{
            position: "absolute",
            inset: "-0.375rem",
            bg: "conic-gradient({colors.primary.500}, {colors.accent.500}, {colors.pageFg}, {colors.primary.500})",
            borderRadius: "full",
            animation: "spin 12s linear infinite",
            _motionReduce: { animation: "none" },
          }}
        />
      )}
      <span className={FACE_CLASS} data-ringed={ring || undefined}>
        {src ? (
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          name.trim().charAt(0) || "▲"
        )}
      </span>
    </Box>
  );
}
