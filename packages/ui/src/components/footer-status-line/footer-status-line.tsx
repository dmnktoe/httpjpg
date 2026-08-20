"use client";

import type { ReactNode } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface FooterStatusLineProps {
  /**
   * Source name shown before the content; the colon is added here so every
   * line punctuates the same way. Omitted, the line starts with its children.
   */
  label?: string;
  /** Turns the whole line into an external link to the item it describes. */
  href?: string;
  /**
   * Replaces the children with a placeholder, holding the line's height while
   * the request is in flight so the footer does not jump when data lands.
   */
  loading?: boolean;
  children?: ReactNode;
  css?: SystemStyleObject;
}

/**
 * One line of the footer's live status stack — Discord presence, the last
 * scrobbled record, a recent film. Every widget renders through this so the
 * stack keeps one rhythm: same height, same monospace scale, same opacity ramp
 * from label to detail.
 */
export function FooterStatusLine({
  label,
  href,
  loading = false,
  children,
  css: cssProp,
}: FooterStatusLineProps) {
  const isLink = Boolean(href) && !loading;

  return (
    <Box
      as={isLink ? "a" : "div"}
      href={isLink ? href : undefined}
      target={isLink ? "_blank" : undefined}
      rel={isLink ? "noopener noreferrer" : undefined}
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "2",
        maxWidth: "full",
        minHeight: "5",
        color: "inherit",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
        textDecoration: "none",
        ...cssProp,
      }}
    >
      {label && (
        <Box as="span" css={{ flexShrink: 0, opacity: 60 }}>
          {label}:
        </Box>
      )}
      {loading ? (
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      ) : (
        children
      )}
    </Box>
  );
}
