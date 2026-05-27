"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  variant?: "default" | "bordered" | "brutalist";
  size?: "sm" | "md" | "lg";
  className?: string;
  css?: SystemStyleObject;
}

const sizeStyles = {
  sm: { fontSize: "sm", py: "2", px: "3" },
  md: { fontSize: "md", py: "3", px: "4" },
  lg: { fontSize: "lg", py: "4", px: "5" },
} as const;

const variantStyles = {
  default: {
    "& [data-accordion-item]": {
      borderBottom: "1px solid",
      borderColor: "pageBorder",
    },
  },
  bordered: {
    border: "1px solid",
    borderColor: "pageBorder",
    "& [data-accordion-item] + [data-accordion-item]": {
      borderTop: "1px solid",
      borderColor: "pageBorder",
    },
  },
  brutalist: {
    border: "2px solid",
    borderColor: "pageFg",
    "& [data-accordion-item] + [data-accordion-item]": {
      borderTop: "2px solid",
      borderColor: "pageFg",
    },
    "& [data-accordion-trigger]": {
      fontFamily: "mono",
      textTransform: "uppercase",
      letterSpacing: "wider",
    },
  },
} as const;

export function Accordion({
  items,
  allowMultiple = false,
  variant = "default",
  size = "md",
  className,
  css: cssProp,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.defaultOpen).map((i) => i.id)),
  );

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const next = new Set(allowMultiple ? prev : []);
        if (prev.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [allowMultiple],
  );

  return (
    <div
      className={cx(
        css({
          width: "full",
          ...variantStyles[variant],
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const panelId = `accordion-panel-${item.id}`;
        const triggerId = `accordion-trigger-${item.id}`;
        return (
          <div key={item.id} data-accordion-item>
            <button
              type="button"
              id={triggerId}
              data-accordion-trigger
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className={css({
                all: "unset",
                boxSizing: "border-box",
                width: "full",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "3",
                cursor: "pointer",
                textAlign: "left",
                ...sizeStyles[size],
                _hover: { bg: "pageBorder", opacity: 0.5 },
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "primary.500",
                  outlineOffset: "-2px",
                },
              })}
            >
              <span>{item.title}</span>
              <span
                aria-hidden="true"
                className={css({
                  fontFamily: "mono",
                  transition: "transform 200ms ease",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                })}
              >
                +
              </span>
            </button>
            <section
              id={panelId}
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className={css({
                ...sizeStyles[size],
                pt: "0",
              })}
            >
              {isOpen && item.content}
            </section>
          </div>
        );
      })}
    </div>
  );
}

Accordion.displayName = "Accordion";
