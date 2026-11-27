import { useId } from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";

export interface FeedPanelBarProps {
  label: string;
}

export function FeedPanelBar({ label }: FeedPanelBarProps) {
  return (
    <Box
      as="span"
      aria-hidden="true"
      data-feed-panel-bar=""
      css={{
        display: "block",
        color: "#4a4a4a",
        bg: "linear-gradient(to bottom, #ececec 0%, #dcdcdc 40%, #c8c8c8 75%, #bababa 100%)",
        borderBottom: "1px solid #5f5f5f",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.95)",
        userSelect: "none",
        textShadow: "0 1px 0 rgba(255, 255, 255, 0.75)",
      }}
    >
      <Box
        as="span"
        css={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          h: "1.375rem",
          px: "0.4375rem",
        }}
      >
        <Box as="span" css={{ display: "flex", gap: "0.3125rem" }}>
          {TRAFFIC_LIGHTS.map((light) => (
            <TrafficLight key={light.kind} light={light} />
          ))}
        </Box>
        <Box as="span" css={{ display: "flex", alignItems: "center", gap: "1" }}>
          <svg viewBox="0 0 16 13" style={{ width: "0.8125rem", height: "0.6875rem" }}>
            <path
              d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3.6l1.5 1.6h5.9A1.5 1.5 0 0 1 15 4.1v6.9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 11z"
              fill="#8fb6e3"
              stroke="#4f78ad"
              strokeWidth="0.8"
            />
            <path d="M1.6 5.2h12.8" stroke="#b9d3f0" strokeWidth="0.8" />
          </svg>
          {label}
        </Box>
        <Box
          as="span"
          css={{
            justifySelf: "end",
            w: "1.375rem",
            h: "0.5rem",
            bg: "linear-gradient(to bottom, #ffffff 0%, #ececec 48%, #d2d2d2 52%, #f1f1f1 100%)",
            border: "1px solid #7b7b7b",
            borderRadius: "full",
            boxShadow: "0 1px 0 rgba(255, 255, 255, 0.6)",
          }}
        />
      </Box>
      <Box
        as="span"
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          h: "1.375rem",
          px: "0.4375rem",
          pb: "0.1875rem",
        }}
      >
        <Box
          as="span"
          css={{
            display: "flex",
            borderRadius: "0.25rem",
            boxShadow: "0 1px 0 rgba(255, 255, 255, 0.65)",
          }}
        >
          {ARROWS.map((arrow) => (
            <Box
              as="span"
              key={arrow.kind}
              css={{
                display: "grid",
                placeItems: "center",
                w: "1.25rem",
                h: "1rem",
                bg: "linear-gradient(to bottom, #fefefe 0%, #f1f1f1 45%, #dedede 55%, #d2d2d2 100%)",
                border: "1px solid #858585",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.95)",
                "&:first-of-type": { borderRadius: "0.25rem 0 0 0.25rem" },
                "&:last-of-type": { borderLeft: "none", borderRadius: "0 0.25rem 0.25rem 0" },
              }}
            >
              <svg
                viewBox="0 0 8 8"
                style={{
                  width: "0.4375rem",
                  height: "0.4375rem",
                  filter: "drop-shadow(0 1px 0 rgba(255, 255, 255, 0.85))",
                }}
              >
                <path d={arrow.path} fill="#5a5a5a" />
              </svg>
            </Box>
          ))}
        </Box>
        <Box
          as="span"
          css={{
            display: "flex",
            alignItems: "center",
            w: "5rem",
            h: "1rem",
            px: "0.3125rem",
            bg: "#ffffff",
            border: "1px solid #7f7f7f",
            borderRadius: "full",
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.65)",
          }}
        >
          <svg viewBox="0 0 10 10" style={{ width: "0.5625rem", height: "0.5625rem" }}>
            <circle cx="4" cy="4" r="2.9" fill="none" stroke="#575757" strokeWidth="1.3" />
            <path d="M6.2 6.2 9 9" stroke="#575757" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}

interface TrafficLightProps {
  light: TrafficLightStyle;
}

function TrafficLight({ light }: TrafficLightProps) {
  const id = useId().replace(/[^\w-]/g, "");
  const rim = `${id}-rim`;
  const body = `${id}-body`;
  const shine = `${id}-shine`;

  return (
    <svg
      viewBox="0 0 16 17"
      data-traffic-light={light.kind}
      style={{ display: "block", width: "0.75rem", height: "0.796875rem" }}
    >
      <defs>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light.rim[0]} />
          <stop offset="1" stopColor={light.rim[1]} />
        </linearGradient>
        <radialGradient id={body} cx="0.5" cy="0.82" r="0.7" fx="0.5" fy="0.95">
          <stop offset="0" stopColor={light.body[0]} />
          <stop offset="0.5" stopColor={light.body[1]} />
          <stop offset="1" stopColor={light.body[2]} />
        </radialGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8.75" r="7.5" fill="#ffffff" fillOpacity="0.6" />
      <circle cx="8" cy="8" r="7.5" fill={`url(#${rim})`} />
      <circle cx="8" cy="8" r="6.6" fill={`url(#${body})`} />
      <ellipse cx="8" cy="4.55" rx="4.5" ry="2.85" fill={`url(#${shine})`} />
      <path
        d={light.glyph}
        data-window-glyph=""
        className={GLYPH_CLASS}
        stroke={light.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface TrafficLightStyle {
  kind: "close" | "minimize" | "zoom";
  rim: readonly [string, string];
  body: readonly [string, string, string];
  ink: string;
  glyph: string;
}

const GLYPH_CLASS = css({ opacity: 0, transition: "opacity 0.15s" });

const TRAFFIC_LIGHTS: readonly TrafficLightStyle[] = [
  {
    kind: "close",
    rim: ["#62100b", "#b8362d"],
    body: ["#ffab9c", "#e8483c", "#a8170f"],
    ink: "#4d0500",
    glyph: "M5.6 5.6 10.4 10.4M10.4 5.6 5.6 10.4",
  },
  {
    kind: "minimize",
    rim: ["#6e4700", "#c8921c"],
    body: ["#ffe9a0", "#f4b324", "#b57904"],
    ink: "#6b4100",
    glyph: "M4.9 8h6.2",
  },
  {
    kind: "zoom",
    rim: ["#124d0c", "#3f9d34"],
    body: ["#c3f7ac", "#45c238", "#1d7a14"],
    ink: "#0d4a07",
    glyph: "M8 4.9v6.2M4.9 8h6.2",
  },
];

const ARROWS = [
  { kind: "back", path: "M6 0.8v6.4L1.2 4z" },
  { kind: "forward", path: "M2 0.8v6.4L6.8 4z" },
] as const;
