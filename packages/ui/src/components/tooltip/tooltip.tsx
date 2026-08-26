"use client";

import { arrow, autoUpdate, flip, shift, useFloating } from "@floating-ui/react-dom";
import {
  Children,
  cloneElement,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { SystemStyleObject } from "styled-system/types";

import { useHasMounted } from "../../lib/use-has-mounted";
import { Box } from "../box/box";

type TriggerProps = HTMLAttributes<HTMLElement> & { tabIndex?: number };

export type TooltipPlacement = "top" | "bottom";

export interface TooltipProps {
  /** Text rendered inside the ASCII frame. Kept to a single line. */
  label: string;
  /** The single element the tooltip describes. It becomes the trigger. */
  children: ReactElement<TriggerProps>;
  /** Preferred side. The bubble flips when that side has no room. */
  placement?: TooltipPlacement;
  /** Milliseconds the pointer has to rest on the trigger. Focus ignores it. */
  delay?: number;
  /** Keeps the trigger interactive but never reveals the bubble. */
  disabled?: boolean;
  className?: string;
  css?: SystemStyleObject;
}

export function Tooltip({
  label,
  children,
  placement = "top",
  delay = 0,
  disabled = false,
  className,
  css: cssProp,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useHasMounted();
  const tailRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = isOpen && !disabled;

  const {
    refs,
    elements,
    floatingStyles,
    middlewareData,
    placement: floatingPlacement,
    update,
  } = useFloating({
    placement,
    strategy: "fixed",
    transform: false,
    middleware: [
      flip(),
      shift({ padding: VIEWPORT_PADDING }),
      // floating-ui's arrow middleware takes the ref object, not `.current`.
      // oxlint-disable-next-line react/refs
      arrow({ element: tailRef, padding: TAIL_PADDING }),
    ],
  });

  useEffect(() => {
    if (!isVisible || !elements.reference || !elements.floating) {
      return;
    }
    return autoUpdate(elements.reference, elements.floating, update);
  }, [isVisible, elements.reference, elements.floating, update]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const cancelPending = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (delay <= 0) {
      setIsOpen(true);
      return;
    }

    cancelPending();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setIsOpen(true);
    }, delay);
  };

  const handleShow = () => {
    cancelPending();
    setIsOpen(true);
  };

  const handleHide = () => {
    cancelPending();
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handleHide();
    }
  };

  const trigger = Children.only(children);
  const resolvedPlacement: TooltipPlacement = floatingPlacement.startsWith("bottom")
    ? "bottom"
    : "top";
  const tail = resolvedPlacement === "top" ? "v" : "^";
  const tailX = middlewareData.arrow?.x;

  const frame = (
    <Box as="span" css={{ display: "block" }}>
      {asciiFrame(label)}
    </Box>
  );

  const pointer = (
    <Box as="span" css={{ display: "block", textAlign: tailX === undefined ? "center" : "left" }}>
      <Box
        as="span"
        ref={tailRef}
        style={tailX === undefined ? undefined : { marginLeft: `${tailX}px` }}
        css={{
          display: "inline-block",
          opacity: 0.55,
          animation: "asciiPulse 2s ease-in-out infinite",
          _motionReduce: { animation: "none" },
        }}
      >
        {tail}
      </Box>
    </Box>
  );

  const bubble = (
    <Box
      as="span"
      // oxlint-disable-next-line react/refs -- floating-ui assigns the floating node
      ref={refs.setFloating}
      id={tooltipId}
      role="tooltip"
      aria-hidden={!isVisible}
      style={floatingStyles}
      css={{
        zIndex: "tooltip",
        visibility: isVisible ? "visible" : "hidden",
        color: "pageFg",
        opacity: isVisible ? 1 : 0,
        fontFamily: "mono",
        fontSize: "xs",
        lineHeight: 1.15,
        textAlign: "center",
        whiteSpace: "pre",
        bg: "pageBg",
        transform: isVisible
          ? "translateY(0)"
          : resolvedPlacement === "top"
            ? "translateY(2px)"
            : "translateY(-2px)",
        transition: "opacity 100ms ease-out, transform 100ms ease-out",
        pointerEvents: "none",
        userSelect: "none",
        _motionReduce: { transition: "none" },
      }}
    >
      {resolvedPlacement === "top" ? frame : pointer}
      {resolvedPlacement === "top" ? pointer : frame}
    </Box>
  );

  return (
    <Box
      as="span"
      // oxlint-disable-next-line react/refs -- floating-ui assigns the reference node
      ref={refs.setReference}
      className={className}
      css={{
        display: "inline-flex",
        alignItems: "center",
        ...cssProp,
      }}
    >
      {
        // oxlint-disable-next-line react/refs -- cloneElement copies the child's ref
        cloneElement(trigger, {
          "aria-describedby": isVisible ? tooltipId : undefined,
          tabIndex: trigger.props.tabIndex ?? 0,
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleHide,
          onFocus: handleShow,
          onBlur: handleHide,
          onKeyDown: handleKeyDown,
        })
      }
      {isMounted && createPortal(bubble, document.body)}
    </Box>
  );
}

export function asciiFrame(rawLabel: string): string {
  const label = rawLabel.replace(/\s+/g, " ").trim();
  const border = `+${"-".repeat(label.length + 2)}+`;
  return [border, `| ${label} |`, border].join("\n");
}

const VIEWPORT_PADDING = 8;

const TAIL_PADDING = 4;
