import type { ReactNode } from "react";

/**
 * Brutalist icon library.
 *
 * All icons are authored on a 24×24 grid with stroke-based geometry
 * (`stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`,
 * `stroke-linejoin="round"`, `fill="none"`). Icons that read better as
 * filled shapes (play, pause, star, heart, bookmark, marker triangles)
 * opt in via `fill="currentColor" stroke="none"` per element.
 *
 * To add an icon: append a new entry below the matching category and
 * extend `IconName` accordingly. Keep the visual weight aligned with
 * the existing set — simple, geometric, 2px stroke.
 */

export type IconName =
  // arrows
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up-right"
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  // media
  | "play"
  | "pause"
  | "stop"
  | "skip-back"
  | "skip-forward"
  | "volume"
  | "volume-mute"
  // ui actions
  | "close"
  | "menu"
  | "more-horizontal"
  | "more-vertical"
  | "plus"
  | "minus"
  | "check"
  | "search"
  | "download"
  | "external"
  | "link"
  // status
  | "info"
  | "warning"
  | "error"
  | "success"
  // content
  | "heart"
  | "star"
  | "bookmark"
  | "calendar"
  | "clock"
  | "eye"
  | "eye-off"
  | "filter"
  // view
  | "grid"
  | "list"
  // communication
  | "mail";

export const ICONS: Record<IconName, ReactNode> = {
  // ---------------------------------------------------------------------------
  // Arrows
  // ---------------------------------------------------------------------------
  "arrow-up": (
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </>
  ),
  "arrow-down": (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </>
  ),
  "arrow-left": (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  "arrow-right": (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  "arrow-up-right": (
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </>
  ),
  "chevron-up": <polyline points="18 15 12 9 6 15" />,
  "chevron-down": <polyline points="6 9 12 15 18 9" />,
  "chevron-left": <polyline points="15 18 9 12 15 6" />,
  "chevron-right": <polyline points="9 18 15 12 9 6" />,

  // ---------------------------------------------------------------------------
  // Media
  // ---------------------------------------------------------------------------
  play: <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />,
  pause: (
    <g fill="currentColor" stroke="none">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </g>
  ),
  stop: <rect x="5" y="5" width="14" height="14" fill="currentColor" stroke="none" />,
  "skip-back": (
    <g fill="currentColor" stroke="none">
      <polygon points="19 20 9 12 19 4 19 20" />
      <rect x="5" y="4" width="2" height="16" />
    </g>
  ),
  "skip-forward": (
    <g fill="currentColor" stroke="none">
      <polygon points="5 4 15 12 5 20 5 4" />
      <rect x="17" y="4" width="2" height="16" />
    </g>
  ),
  volume: (
    <polygon
      points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
      fill="currentColor"
      stroke="currentColor"
      strokeLinejoin="round"
    />
  ),
  "volume-mute": (
    <>
      <polygon
        points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </>
  ),

  // ---------------------------------------------------------------------------
  // UI actions
  // ---------------------------------------------------------------------------
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  menu: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </>
  ),
  "more-horizontal": (
    <g fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </g>
  ),
  "more-vertical": (
    <g fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </g>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
  check: <polyline points="20 6 9 17 4 12" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16" y2="16" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  external: (
    <>
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
    </>
  ),

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  warning: (
    <>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="17 9 11 15 8 12" />
    </>
  ),

  // ---------------------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------------------
  heart: (
    <path
      d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 11c0 5.65-9 10-9 10z"
      fill="currentColor"
      stroke="none"
    />
  ),
  star: (
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill="currentColor"
      stroke="none"
    />
  ),
  bookmark: (
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor" stroke="none" />
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M17.94 17.94A10.45 10.45 0 0 1 12 19c-7 0-10-7-10-7a13.16 13.16 0 0 1 3.18-4.18" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  ),
  filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,

  // ---------------------------------------------------------------------------
  // View switch
  // ---------------------------------------------------------------------------
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),

  // ---------------------------------------------------------------------------
  // Communication
  // ---------------------------------------------------------------------------
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2 6 12 13 22 6" />
    </>
  ),
};

/**
 * Category groupings for documentation surfaces (storybook overview, etc).
 * Order here defines the canonical display order.
 */
export const ICON_GROUPS = [
  {
    label: "Arrows",
    names: [
      "arrow-up",
      "arrow-down",
      "arrow-left",
      "arrow-right",
      "arrow-up-right",
      "chevron-up",
      "chevron-down",
      "chevron-left",
      "chevron-right",
    ] as IconName[],
  },
  {
    label: "Media",
    names: [
      "play",
      "pause",
      "stop",
      "skip-back",
      "skip-forward",
      "volume",
      "volume-mute",
    ] as IconName[],
  },
  {
    label: "UI Actions",
    names: [
      "close",
      "menu",
      "more-horizontal",
      "more-vertical",
      "plus",
      "minus",
      "check",
      "search",
      "download",
      "external",
      "link",
    ] as IconName[],
  },
  {
    label: "Status",
    names: ["info", "warning", "error", "success"] as IconName[],
  },
  {
    label: "Content",
    names: [
      "heart",
      "star",
      "bookmark",
      "calendar",
      "clock",
      "eye",
      "eye-off",
      "filter",
    ] as IconName[],
  },
  {
    label: "View",
    names: ["grid", "list"] as IconName[],
  },
  {
    label: "Communication",
    names: ["mail"] as IconName[],
  },
] as const;

export const ICON_NAMES: IconName[] = ICON_GROUPS.flatMap((group) => group.names);
