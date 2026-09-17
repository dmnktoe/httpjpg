import { useId } from "react";

import type { DesktopFileKind } from "./lib";

export interface DesktopDownloadPlaceholderProps {
  kind: DesktopFileKind;
}

const KIND_LABEL: Record<DesktopFileKind, string> = {
  pdf: "PDF",
  zip: "ZIP",
  image: "IMG",
  video: "VID",
  audio: "SND",
  document: "DOC",
  file: "FILE",
};

const KIND_COLOR: Record<DesktopFileKind, string> = {
  pdf: "#c42b1c",
  zip: "#c4a00a",
  image: "#2f9e44",
  video: "#5c4dcc",
  audio: "#0b7285",
  document: "#1c4ea3",
  file: "#4a5568",
};

/** Drawn stand-in until real 32×32 XP icons land in `DESKTOP_ICON_SRC`. */
export function DesktopDownloadPlaceholder({ kind }: DesktopDownloadPlaceholderProps) {
  const rawId = useId().replace(/:/g, "");
  const paper = `${rawId}-paper`;
  const gloss = `${rawId}-gloss`;
  const label = KIND_LABEL[kind];
  const accent = KIND_COLOR[kind];

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", filter: "drop-shadow(1px 2px 1px rgba(0, 0, 0, 0.45))" }}
    >
      <defs>
        <linearGradient id={paper} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe4ee" />
        </linearGradient>
        <linearGradient id={gloss} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path
        d="M7 2.5h12.2L25.5 9v20.5H7z"
        fill={`url(#${paper})`}
        stroke="#3d4a63"
        strokeWidth="1"
      />
      <path d="M19.2 2.6v6.6h6.4" fill="#c5cde0" stroke="#3d4a63" strokeWidth="1" />
      <rect x="7.6" y="2.6" width="3.2" height="26.8" fill={accent} />
      <rect x="7.6" y="2.6" width="3.2" height="8" fill={`url(#${gloss})`} />
      <KindMark kind={kind} accent={accent} />
      <text
        x="22.2"
        y="28.4"
        textAnchor="end"
        fill={accent}
        fontFamily="Tahoma, 'MS Sans Serif', sans-serif"
        fontSize="5"
        fontWeight="700"
      >
        {label}
      </text>
    </svg>
  );
}

function KindMark({ kind, accent }: { kind: DesktopFileKind; accent: string }) {
  switch (kind) {
    case "image":
      return (
        <>
          <rect
            x="13.5"
            y="12"
            width="10"
            height="8"
            rx="0.6"
            fill="#9fd4ff"
            stroke={accent}
            strokeWidth="0.7"
          />
          <path d="M14 19.2 17.2 15l2.2 2.4 1.2-1.4 2.6 3.2" fill="#3b6d1f" />
          <circle cx="21.4" cy="14.2" r="1" fill="#f6c945" />
        </>
      );
    case "video":
      return <path d="M14 12.5h6.5l2 2.2V20H14z" fill={accent} />;
    case "audio":
      return (
        <>
          <path d="M15 13.5v7l5-1.6v-7z" fill={accent} />
          <rect x="13.2" y="18.4" width="2.2" height="3.2" rx="0.4" fill={accent} />
        </>
      );
    case "zip":
      return (
        <>
          <rect x="16.2" y="11.5" width="2.2" height="2.2" fill="#3d4a63" />
          <rect
            x="16.2"
            y="14.2"
            width="2.2"
            height="2.2"
            fill="#f4f6fb"
            stroke="#3d4a63"
            strokeWidth="0.4"
          />
          <rect x="16.2" y="16.9" width="2.2" height="2.2" fill="#3d4a63" />
        </>
      );
    default:
      return (
        <>
          <rect x="13.5" y="12.5" width="10" height="1.1" fill="#8b95a8" />
          <rect x="13.5" y="15" width="8.2" height="1.1" fill="#8b95a8" />
          <rect x="13.5" y="17.5" width="9.2" height="1.1" fill="#8b95a8" />
        </>
      );
  }
}
