import type { HTMLAttributes, ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export type FeedView = "auto" | "grid" | "list";

export interface FeedGridProps extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  children: ReactNode;
  /**
   * `list` is one column of whole posts, `grid` three columns of square tiles.
   * `auto` lets the viewport choose: a list on a phone, a grid from `md` up.
   * @default "auto"
   */
  view?: FeedView;
  css?: SystemStyleObject;
}

const GRID_VIEW = {
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "0.5",
  maxW: "none",
  "& [data-feed-post]": { position: "relative", gap: "0" },
  "& [data-feed-frame]": { aspectRatio: "1" },
  "& [data-feed-slide]:not(:first-child)": { display: "none" },
  "& [data-feed-nav]": { display: "none" },
  "& [data-feed-dots]": { display: "none" },
  "& [data-feed-meta]": { display: "none" },
  "& [data-feed-player]": { display: "none" },
  "& [data-feed-tile]": { display: "flex" },
  "& [data-feed-badge]": { display: "block" },
  "& [data-feed-counter]": { top: "1", right: "1", px: "1", fontSize: "xs" },
  "& [data-feed-caption]": {
    position: "absolute",
    inset: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "safe center",
    p: "3",
    color: "white",
    opacity: 0,
    fontFamily: "mono",
    textAlign: "center",
    bg: "rgba(0, 0, 0, 0.6)",
    transition: "opacity 0.2s",
    overflow: "hidden",
    pointerEvents: "none",
  },
  "& [data-feed-post]:hover [data-feed-caption]": { opacity: 1 },
  "& [data-feed-post]:focus-within [data-feed-caption]": { opacity: 1 },
} as const;

export function FeedGrid({ children, view = "auto", css: cssProp, ...props }: FeedGridProps) {
  return (
    <Box
      data-feed-view={view}
      css={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "12",
        alignItems: "start",
        maxW: "30rem",
        mx: "auto",
        "&[data-feed-view=grid]": GRID_VIEW,
        "&[data-feed-view=auto]": { md: GRID_VIEW },
        ...cssProp,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
