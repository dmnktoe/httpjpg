import type { HTMLAttributes, ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface FeedGridProps extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  children: ReactNode;
  css?: SystemStyleObject;
}

export function FeedGrid({ children, css: cssProp, ...props }: FeedGridProps) {
  return (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: { base: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" },
        gap: { base: "10", md: "6" },
        alignItems: "start",
        "& [data-feed-frame]": { md: { aspectRatio: "1" } },
        "& [data-feed-caption]": { md: { lineClamp: 2 } },
        ...cssProp,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
