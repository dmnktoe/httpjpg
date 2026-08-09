"use client";

import {
  Children,
  cloneElement,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  useId,
  useState,
} from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

type TriggerProps = HTMLAttributes<HTMLElement> & { tabIndex?: number };

export type TooltipPlacement = "top" | "bottom";

export interface TooltipProps {
  /** Text rendered inside the ASCII frame. Kept to a single line. */
  label: string;
  /** The single element the tooltip describes. It becomes the trigger. */
  children: ReactElement<TriggerProps>;
  placement?: TooltipPlacement;
  /** Keeps the trigger interactive but never reveals the bubble. */
  disabled?: boolean;
  className?: string;
  css?: SystemStyleObject;
}

export function Tooltip({
  label,
  children,
  placement = "top",
  disabled = false,
  className,
  css: cssProp,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const isVisible = isOpen && !disabled;
  const trigger = Children.only(children);
  const tail = placement === "top" ? "v" : "^";

  const frame = (
    <Box as="span" css={{ display: "block" }}>
      {asciiFrame(label)}
    </Box>
  );

  const pointer = (
    <Box
      as="span"
      css={{
        display: "block",
        opacity: 0.55,
        animation: "asciiPulse 2s ease-in-out infinite",
        _motionReduce: { animation: "none" },
      }}
    >
      {tail}
    </Box>
  );

  return (
    <Box
      as="span"
      className={className}
      css={{
        display: "inline-flex",
        position: "relative",
        alignItems: "center",
        ...cssProp,
      }}
    >
      {cloneElement(trigger, {
        "aria-describedby": isVisible ? tooltipId : undefined,
        tabIndex: trigger.props.tabIndex ?? 0,
        onMouseEnter: () => setIsOpen(true),
        onMouseLeave: () => setIsOpen(false),
        onFocus: () => setIsOpen(true),
        onBlur: () => setIsOpen(false),
        onKeyDown: handleKeyDown,
      })}
      <Box
        as="span"
        id={tooltipId}
        role="tooltip"
        aria-hidden={!isVisible}
        css={{
          position: "absolute",
          left: "50%",
          zIndex: "tooltip",
          transform: `translateX(-50%) translateY(${isVisible ? "0" : OFFSETS[placement]})`,
          ...PLACEMENTS[placement],
          color: "pageFg",
          bg: "pageBg",
          opacity: isVisible ? 1 : 0,
          fontFamily: "mono",
          fontSize: "xs",
          lineHeight: 1.15,
          whiteSpace: "pre",
          textAlign: "center",
          userSelect: "none",
          pointerEvents: "none",
          visibility: isVisible ? "visible" : "hidden",
          transition: "opacity 100ms ease-out, transform 100ms ease-out",
          _motionReduce: { transition: "none" },
        }}
      >
        {placement === "top" ? frame : pointer}
        {placement === "top" ? pointer : frame}
      </Box>
    </Box>
  );
}

export function asciiFrame(rawLabel: string): string {
  const label = rawLabel.replace(/\s+/g, " ").trim();
  const border = `+${"-".repeat(label.length + 2)}+`;
  return [border, `| ${label} |`, border].join("\n");
}

const OFFSETS: Record<TooltipPlacement, string> = {
  top: "2px",
  bottom: "-2px",
};

const PLACEMENTS: Record<TooltipPlacement, SystemStyleObject> = {
  top: { bottom: "100%" },
  bottom: { top: "100%" },
};
