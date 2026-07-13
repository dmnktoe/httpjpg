"use client";

import type { SystemStyleObject } from "styled-system/types";

import { Badge } from "./badge";
import { BadgeGroup } from "./badge-group";

export interface BadgeItem {
  src: string;
  alt: string;
  href?: string;
  title?: string;
}

export interface BadgesProps {
  /** The badges to render, in order. */
  items: BadgeItem[];
  /** Space between badges. @default "2" */
  gap?: string | number;
  /** Cross-axis alignment of badges with differing heights. @default "center" */
  align?: "start" | "center" | "end";
  /** Main-axis distribution of the row. @default "start" */
  justify?: "start" | "center" | "end";
  /** Wrap onto multiple lines when the row overflows. @default true */
  wrap?: boolean;
  /** Render inline-level so the row flows next to surrounding inline content. @default false */
  inline?: boolean;
  /** Height of every badge. @default "1.5em" */
  height?: string;
  className?: string;
  css?: SystemStyleObject;
}

export function Badges({
  items,
  gap,
  align,
  justify,
  wrap,
  inline,
  height,
  className,
  css: cssProp,
}: BadgesProps) {
  if (!items.length) {
    return null;
  }
  return (
    <BadgeGroup
      gap={gap}
      align={align}
      justify={justify}
      wrap={wrap}
      inline={inline}
      className={className}
      css={cssProp}
    >
      {items.map((item, index) => (
        <Badge
          key={`${item.src}-${index}`}
          src={item.src}
          alt={item.alt}
          href={item.href}
          title={item.title}
          height={height}
        />
      ))}
    </BadgeGroup>
  );
}
