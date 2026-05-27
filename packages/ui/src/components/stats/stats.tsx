"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface StatItem {
  id: string;
  value: ReactNode;
  label: ReactNode;
  caption?: ReactNode;
}

export interface StatsProps {
  items: StatItem[];
  columns?: 1 | 2 | 3 | 4;
  variant?: "default" | "boxed" | "brutalist";
  align?: "left" | "center";
  className?: string;
  css?: SystemStyleObject;
}

const columnsMap = {
  1: "repeat(1, 1fr)",
  2: "repeat(2, 1fr)",
  3: "repeat(3, 1fr)",
  4: "repeat(4, 1fr)",
} as const;

const variantItemStyles = {
  default: {},
  boxed: {
    border: "1px solid",
    borderColor: "pageBorder",
    p: "5",
  },
  brutalist: {
    border: "2px solid",
    borderColor: "pageFg",
    p: "5",
    bg: "pageBg",
  },
} as const;

export const Stats = forwardRef<HTMLDivElement, StatsProps>(function Stats(
  { items, columns = 3, variant = "default", align = "left", className, css: cssProp },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        css({
          display: "grid",
          gridTemplateColumns: {
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: columnsMap[columns],
          },
          gap: "6",
          width: "full",
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "1",
            textAlign: align,
            alignItems: align === "center" ? "center" : "flex-start",
            ...variantItemStyles[variant],
          })}
        >
          <div
            className={css({
              fontSize: { base: "4xl", md: "5xl" },
              fontWeight: "black",
              lineHeight: "none",
              fontFamily: "mono",
            })}
          >
            {item.value}
          </div>
          <div
            className={css({
              fontSize: "sm",
              textTransform: "uppercase",
              letterSpacing: "wider",
              color: "pageMuted",
            })}
          >
            {item.label}
          </div>
          {item.caption && (
            <div
              className={css({
                fontSize: "xs",
                color: "pageMuted",
                mt: "1",
              })}
            >
              {item.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

Stats.displayName = "Stats";
