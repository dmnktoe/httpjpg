"use client";

import type { HTMLAttributes, ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface FooterStatusLineTextProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "css" | "children"
> {
  /** Caps the run before it pushes the rest of the line out of view. */
  maxWidth?: string;
  /** Detail that should not shrink, like a year or a rating. */
  fixed?: boolean;
  /** Lower for incidental detail, so the line reads title first. */
  dim?: boolean;
  children: ReactNode;
  css?: SystemStyleObject;
}

/**
 * A run of text inside a status line. Titles are long and arbitrary, so the
 * default truncates rather than wrapping the footer onto a second row.
 */
export function FooterStatusLineText({
  maxWidth = "200px",
  fixed = false,
  dim = false,
  children,
  css: cssProp,
  ...props
}: FooterStatusLineTextProps) {
  return (
    <Box
      as="span"
      {...props}
      css={{
        ...(fixed
          ? { flexShrink: 0, whiteSpace: "nowrap" }
          : {
              minWidth: "0",
              maxWidth,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }),
        opacity: dim ? 50 : 70,
        ...cssProp,
      }}
    >
      {children}
    </Box>
  );
}
